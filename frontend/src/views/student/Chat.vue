<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getToken, getUser } from '@/utils/auth'
import { io } from 'socket.io-client'
import { getContacts, getChatMessages, uploadChatFile } from '@/api/message'
import { Search, Loading, Picture, Folder, Close } from '@element-plus/icons-vue'
import gsap from 'gsap'
import { ElMessage, ElImageViewer } from 'element-plus'

const currentUser = getUser()
const currentUserId = currentUser?.id

// ─── mobile ────────────────────────────────────────────────────────
const isMobile = ref(window.innerWidth < 768)
const showChat = ref(false)
function onResize() { isMobile.value = window.innerWidth < 768 }

// ─── contacts ────────────────────────────────────────────────────
const contacts = ref([])
const searchQuery = ref('')
const contactListRef = ref(null)

const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value
  const q = searchQuery.value.toLowerCase()
  return contacts.value.filter((c) => c.name && c.name.toLowerCase().includes(q))
})

// ─── active chat ─────────────────────────────────────────────────
const activeContactId = ref(null)
const activeContact = computed(() =>
  contacts.value.find((c) => c.id === activeContactId.value) || null
)

// ─── messages ────────────────────────────────────────────────────
const messages = ref([])
const messagesRef = ref(null)
const loadingMessages = ref(false)
const loadingHistory = ref(false)
const hasMore = ref(true)

// ─── input ───────────────────────────────────────────────────────
const inputText = ref('')
const fileInputRef = ref(null)
const imageInputRef = ref(null)
const uploading = ref(false)

// ─── image preview ───────────────────────────────────────────────
const previewVisible = ref(false)
const previewUrl = ref('')

// ─── typing indicator ───────────────────────────────────────────
const typingUsers = reactive({})
const typingTimeouts = {}

// ─── socket ──────────────────────────────────────────────────────
let socket = null
let typingTimer = null
let gsapCtx = null

// ─── helpers ─────────────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function truncate(str, len = 20) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

function isSelf(msg) {
  if (!msg) return false
  const senderId = msg.senderId ?? msg.sender_id
  return senderId === currentUserId || senderId === 0 || senderId === 'self'
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const fileIconMap = {
  pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑',
  zip: '📦', rar: '📦',
}

function fileIcon(name) {
  if (!name) return '📎'
  const ext = name.split('.').pop().toLowerCase()
  return fileIconMap[ext] || '📎'
}

// ─── data loading ────────────────────────────────────────────────
async function loadContacts() {
  try {
    const res = await getContacts()
    const list = res.data?.contacts || res.contacts || []
    // Merge with existing online status
    list.forEach((c) => {
      const existing = contacts.value.find((ec) => ec.id === c.id)
      if (existing && existing.online) c.online = true
    })
    contacts.value = list
  } catch {
    contacts.value = []
    ElMessage.error('加载联系人失败')
  }
}

async function loadMessages(contactId, options = {}) {
  try {
    const { beforeId } = options
    if (beforeId) {
      loadingHistory.value = true
    } else {
      loadingMessages.value = true
    }

    const res = await getChatMessages(contactId, { beforeId, limit: 20 })
    const list = res.data?.messages || res.data?.rows || res.data || []
    const ordered = [...list].reverse()

    if (beforeId) {
      messages.value = [...ordered, ...messages.value]
      hasMore.value = list.length >= 20
    } else {
      messages.value = ordered
      hasMore.value = list.length >= 20
      await nextTick()
      scrollToBottom()
    }
  } catch {
    ElMessage.error('加载消息失败')
  } finally {
    loadingMessages.value = false
    loadingHistory.value = false
  }
}

// ─── contact selection ───────────────────────────────────────────
function selectContact(contact) {
  if (activeContactId.value === contact.id) return
  markCurrentAsRead()
  activeContactId.value = contact.id
  contact.unreadCount = 0
  messages.value = []
  showChat.value = true
  loadMessages(contact.id)
}

function backToContacts() {
  markCurrentAsRead()
  activeContactId.value = null
  showChat.value = false
  messages.value = []
}

function markCurrentAsRead() {
  if (!activeContactId.value || !socket) return
  const unreadIds = messages.value
    .filter((m) => !isSelf(m) && !m.read)
    .map((m) => m.id)
  if (unreadIds.length) {
    socket.emit('chat:read', { messageIds: unreadIds })
  }
}

// ─── send message ────────────────────────────────────────────────
function sendMessage() {
  const text = inputText.value.trim()
  if (!text || !activeContactId.value || !socket) return

  socket.emit('chat:message', {
    receiverId: activeContactId.value,
    content: text,
    messageType: 'text',
  })

  const tempMsg = {
    id: 'temp_' + Date.now(),
    senderId: currentUserId,
    receiverId: activeContactId.value,
    content: text,
    messageType: 'text',
    createdAt: new Date().toISOString(),
    sending: true,
  }
  messages.value.push(tempMsg)
  inputText.value = ''

  nextTick(() => {
    scrollToBottom()
    animateNewMessage()
  })
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// ─── file / image upload ─────────────────────────────────────────
function triggerImagePicker() {
  const el = imageInputRef.value
  if (el) el.click()
}

function triggerFilePicker() {
  const el = fileInputRef.value
  if (el) el.click()
}

async function handleImageSelected(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  await uploadAndSend(file, 'image')
}

async function handleFileSelected(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  await uploadAndSend(file, 'file')
}

async function handlePaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      await uploadAndSend(file, 'image')
      return
    }
  }
}

async function uploadAndSend(file, type) {
  if (!activeContactId.value || !socket) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadChatFile(formData)
    const { url, name, size } = res.data || res

    socket.emit('chat:message', {
      receiverId: activeContactId.value,
      content: name,
      messageType: type,
      fileUrl: url,
      fileName: name,
      fileSize: size,
    })

    const tempMsg = {
      id: 'temp_' + Date.now(),
      senderId: currentUserId,
      receiverId: activeContactId.value,
      content: name,
      messageType: type,
      fileUrl: url,
      fileName: name,
      fileSize: size,
      createdAt: new Date().toISOString(),
      sending: true,
    }
    messages.value.push(tempMsg)
    await nextTick()
    scrollToBottom()
    animateNewMessage()
  } catch {
    ElMessage.error('文件上传失败')
  } finally {
    uploading.value = false
  }
}

// ─── image preview ───────────────────────────────────────────────
function openImagePreview(url) {
  previewUrl.value = url
  previewVisible.value = true
}

// ─── typing indicator ────────────────────────────────────────────
function handleTyping() {
  if (!socket || !activeContactId.value) return
  if (typingTimer) return
  socket.emit('chat:typing', { receiverId: activeContactId.value })
  typingTimer = setTimeout(() => { typingTimer = null }, 2000)
}

// ─── infinite scroll ─────────────────────────────────────────────
function handleScroll(e) {
  const el = e.target
  if (el.scrollTop <= 30 && hasMore.value && !loadingHistory.value && activeContactId.value) {
    const firstMsg = messages.value[0]
    if (firstMsg) {
      loadMessages(activeContactId.value, { beforeId: firstMsg.id })
    }
  }
}

// ─── gsap animations ─────────────────────────────────────────────
function animateNewMessage() {
  if (!messagesRef.value) return
  const items = messagesRef.value.querySelectorAll('.message-item')
  const last = items[items.length - 1]
  if (last) {
    gsap.from(last, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.out' })
  }
}

// ─── lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('resize', onResize)
  // 1. connect socket first so we receive online status
  socket = io('/', {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect_error', () => {
    ElMessage.error('聊天服务连接失败')
  })

  socket.on('connect', () => {
    // 2. load contacts after socket is ready, so online events update them
    loadContacts().then(() => {
      nextTick(() => {
        if (contactListRef.value) {
          gsapCtx = gsap.context(() => {
            gsap.from('.contact-item', {
              opacity: 0, x: -30, duration: 0.4, stagger: 0.05, ease: 'power2.out',
            })
          }, contactListRef.value)
        }
      })
    })
  })

  // Incoming message
  socket.on('chat:message', (msg) => {
    const isFromSelf = isSelf(msg)
    const contactId = isFromSelf ? msg.receiverId : msg.senderId

    if (isFromSelf) {
      // Replace temp message or append
      const idx = messages.value.findIndex(
        (m) => typeof m.id === 'string' && m.id.startsWith('temp_') &&
          m.messageType === msg.messageType &&
          (m.content === msg.content || m.fileName === msg.fileName)
      )
      if (idx !== -1 && activeContactId.value === contactId) {
        messages.value[idx] = { ...msg, sending: false }
        return
      }
    }

    // Update contact's last message
    const contact = contacts.value.find((c) => c.id === contactId)
    if (contact) {
      contact.lastMessage = msg.messageType === 'image' ? '[图片]' :
        msg.messageType === 'file' ? `[文件] ${msg.fileName}` : msg.content
      contact.lastMessageTime = msg.createdAt

      if (activeContactId.value === contactId) {
        messages.value.push(msg)
        nextTick(() => { scrollToBottom(); animateNewMessage() })
        socket.emit('chat:read', { messageIds: [msg.id] })
      } else {
        contact.unreadCount = (contact.unreadCount || 0) + 1
      }
    }
  })

  // Typing indicator
  socket.on('chat:typing', ({ senderId }) => {
    typingUsers[senderId] = true
    if (typingTimeouts[senderId]) clearTimeout(typingTimeouts[senderId])
    typingTimeouts[senderId] = setTimeout(() => {
      typingUsers[senderId] = false
      delete typingTimeouts[senderId]
    }, 3000)
  })

  // Online / offline
  socket.on('user:online', ({ userId }) => {
    const contact = contacts.value.find((c) => c.id === userId)
    if (contact) contact.online = true
  })

  socket.on('user:offline', ({ userId }) => {
    const contact = contacts.value.find((c) => c.id === userId)
    if (contact) contact.online = false
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (socket) { socket.disconnect(); socket = null }
  if (gsapCtx) { gsapCtx.revert(); gsapCtx = null }
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null }
  Object.values(typingTimeouts).forEach((t) => clearTimeout(t))
})
</script>

<template>
  <div class="chat-page">
    <!-- Left: Contact List -->
    <aside class="chat-sidebar" :class="{ 'mobile-hidden': isMobile && showChat, 'mobile-full': isMobile && !showChat }">
      <div class="sidebar-header"><span>联系人</span></div>
      <div class="sidebar-search">
        <el-input v-model="searchQuery" placeholder="搜索联系人" :prefix-icon="Search" clearable />
      </div>
      <div ref="contactListRef" class="contact-list">
        <div
          v-for="contact in filteredContacts"
          :key="contact.id"
          class="contact-item"
          :class="{ active: activeContactId === contact.id }"
          @click="selectContact(contact)"
        >
          <div class="contact-avatar-wrap">
            <el-avatar :src="contact.avatar" :size="44">
              {{ contact.name ? contact.name.charAt(0) : '' }}
            </el-avatar>
            <span class="online-dot" :class="{ online: contact.online }"></span>
          </div>
          <div class="contact-info">
            <div class="contact-top">
              <span class="contact-name">{{ contact.name }}</span>
              <el-tag size="small" :type="contact.role === 'admin' ? 'danger' : ''">
                {{ contact.role === 'admin' ? '管理员' : '学生' }}
              </el-tag>
            </div>
            <div class="contact-bottom">
              <span class="contact-preview">{{ truncate(contact.lastMessage) }}</span>
              <span class="contact-time">{{ formatTime(contact.lastMessageTime) }}</span>
            </div>
          </div>
          <el-badge :value="contact.unreadCount" :hidden="!contact.unreadCount" :max="99" class="unread-badge" />
        </div>
        <el-empty v-if="!filteredContacts.length" description="暂无联系人" :image-size="80" />
      </div>
    </aside>

    <!-- Right: Chat Area -->
    <main class="chat-main" :class="{ 'mobile-hidden': isMobile && !showChat, 'mobile-full': isMobile && showChat }" @paste="handlePaste">
      <template v-if="activeContact">
        <header class="chat-header">
          <div class="chat-header-left">
            <button v-if="isMobile" class="back-btn" @click="backToContacts">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <el-avatar :src="activeContact.avatar" :size="36">
              {{ activeContact.name ? activeContact.name.charAt(0) : '' }}
            </el-avatar>
            <div class="chat-header-info">
              <span class="chat-header-name">{{ activeContact.name }}</span>
              <span class="chat-header-status" :class="{ online: activeContact.online }">
                {{ activeContact.online ? '在线' : '离线' }}
              </span>
            </div>
          </div>
        </header>

        <!-- Messages -->
        <div ref="messagesRef" class="chat-messages" @scroll="handleScroll">
          <div v-if="loadingHistory" class="history-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-if="!hasMore && messages.length" class="history-end">没有更多消息了</div>
          <div v-if="loadingMessages" class="messages-loading">
            <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          </div>
          <div v-else-if="!messages.length && !loadingHistory" class="messages-empty">
            <el-empty description="暂无消息" :image-size="100" />
          </div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item"
            :class="{ self: isSelf(msg) }"
          >
            <span v-if="!isSelf(msg)" class="message-sender">{{ activeContact?.name }}</span>
            <div class="message-bubble">
              <template v-if="msg.sending">
                <template v-if="msg.messageType === 'image'">
                  <img :src="msg.fileUrl" class="msg-image sending" alt="" />
                </template>
                <template v-else-if="msg.messageType === 'file'">
                  <div class="msg-file">
                    <span class="msg-file-icon">{{ fileIcon(msg.fileName) }}</span>
                    <span class="msg-file-name">{{ msg.fileName }}</span>
                    <span class="msg-file-size">{{ formatSize(msg.fileSize) }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="message-content">{{ msg.content }}</div>
                </template>
                <div class="message-time sending">发送中...</div>
              </template>
              <template v-else>
                <template v-if="msg.messageType === 'image'">
                  <img
                    :src="msg.fileUrl"
                    class="msg-image"
                    alt="图片"
                    @click="openImagePreview(msg.fileUrl)"
                  />
                </template>
                <template v-else-if="msg.messageType === 'file'">
                  <a :href="msg.fileUrl" target="_blank" class="msg-file-link">
                    <div class="msg-file">
                      <span class="msg-file-icon">{{ fileIcon(msg.fileName) }}</span>
                      <div class="msg-file-info">
                        <span class="msg-file-name">{{ msg.fileName }}</span>
                        <span class="msg-file-size">{{ formatSize(msg.fileSize) }}</span>
                      </div>
                    </div>
                  </a>
                </template>
                <template v-else>
                  <div class="message-content">{{ msg.content }}</div>
                </template>
                <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
              </template>
            </div>
          </div>

          <!-- Typing indicator -->
          <Transition name="typing-fade">
            <div v-if="typingUsers[activeContactId]" class="typing-indicator">
              <span class="typing-dots"><i></i><i></i><i></i></span>
              <span>对方正在输入...</span>
            </div>
          </Transition>
        </div>

        <!-- Input Area -->
        <footer class="chat-input-area">
          <div class="input-toolbar">
            <el-button :icon="Picture" circle size="small" @click="triggerImagePicker" :disabled="uploading" />
            <el-button :icon="Folder" circle size="small" @click="triggerFilePicker" :disabled="uploading" />
            <el-icon v-if="uploading" class="is-loading upload-spin"><Loading /></el-icon>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入消息，Enter 发送，Shift+Enter 换行，支持粘贴图片"
            resize="none"
            @keydown="handleKeydown"
            @input="handleTyping"
            :disabled="uploading"
          />
          <el-button type="primary" :disabled="!inputText.trim()" @click="sendMessage">发送</el-button>

          <input ref="imageInputRef" type="file" accept="image/*" hidden @change="handleImageSelected" />
          <input ref="fileInputRef" type="file" hidden @change="handleFileSelected" />
        </footer>
      </template>

      <!-- No contact selected -->
      <div v-else class="chat-empty">
        <el-empty description="选择一个联系人开始聊天" :image-size="160" />
      </div>
    </main>

    <!-- Image preview -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewUrl]"
      @close="previewVisible = false"
    />
  </div>
</template>

<style scoped>
/* ═══════════════ Layout ═══════════════ */
.chat-page {
  display: flex;
  height: calc(100vh - var(--header-height, 56px));
  background: #f5f7fa;
}

/* ═══════════════ Left Sidebar ═══════════════ */
.chat-sidebar {
  width: 300px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: #fff; border-right: 1px solid #dcdfe6;
}
.sidebar-header { padding: 16px 20px; font-size: 16px; font-weight: 600; color: #303133; border-bottom: 1px solid #f2f2f5; flex-shrink: 0; }
.sidebar-search { padding: 12px 16px; flex-shrink: 0; }
.contact-list { flex: 1; overflow-y: auto; padding: 4px 0; }
.contact-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; cursor: pointer; transition: background 0.2s; position: relative; }
.contact-item:hover { background: #f5f7fa; }
.contact-item.active { background: #ecf5ff; }
.contact-avatar-wrap { position: relative; flex-shrink: 0; }
.online-dot { position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; background: #c0c4cc; border: 2px solid #fff; }
.online-dot.online { background: #67c23a; }
.contact-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.contact-top { display: flex; align-items: center; gap: 6px; }
.contact-name { font-size: 14px; font-weight: 500; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-top .el-tag { flex-shrink: 0; }
.contact-bottom { display: flex; justify-content: space-between; align-items: center; }
.contact-preview { font-size: 12px; color: #909399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.contact-time { font-size: 11px; color: #c0c4cc; flex-shrink: 0; }
.unread-badge { position: absolute; top: 8px; right: 12px; }

/* ═══════════════ Right: Chat Main ═══════════════ */
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #fff; }
.chat-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-bottom: 1px solid #f2f2f5; flex-shrink: 0; }
.chat-header-left { display: flex; align-items: center; gap: 12px; }
.chat-header-info { display: flex; flex-direction: column; gap: 2px; }
.chat-header-name { font-size: 16px; font-weight: 600; color: #303133; }
.chat-header-status { font-size: 12px; color: #c0c4cc; }
.chat-header-status.online { color: #67c23a; }

/* ─── Messages ─── */
.chat-messages { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.history-loading, .history-end { text-align: center; font-size: 12px; color: #c0c4cc; padding: 8px 0; display: flex; align-items: center; justify-content: center; gap: 4px; }
.messages-loading { display: flex; justify-content: center; align-items: center; height: 100%; color: #c0c4cc; }
.messages-empty { display: flex; justify-content: center; align-items: center; height: 100%; }

/* ─── Message Bubble ─── */
.message-item { display: flex; flex-direction: column; max-width: 70%; }
.message-sender { font-size: 11px; color: #909399; margin-bottom: 2px; padding-left: 4px; }
.message-item.self { align-self: flex-end; align-items: flex-end; }
.message-item:not(.self) { align-self: flex-start; align-items: flex-start; }
.message-bubble { padding: 10px 16px; border-radius: 12px; word-break: break-word; overflow: hidden; }
.message-item:not(.self) .message-bubble { background: #f2f3f5; border-bottom-left-radius: 4px; }
.message-item.self .message-bubble { background: #409eff; color: #fff; border-bottom-right-radius: 4px; }
.message-content { font-size: 14px; line-height: 1.6; }
.message-time { font-size: 11px; margin-top: 4px; text-align: right; }
.message-item:not(.self) .message-time { color: #c0c4cc; }
.message-item.self .message-time { color: rgba(255,255,255,0.7); }
.message-time.sending { font-style: italic; }

/* ─── Image message ─── */
.msg-image { max-width: 240px; max-height: 240px; border-radius: 8px; cursor: pointer; display: block; }
.msg-image.sending { opacity: 0.6; }

/* ─── File message ─── */
.msg-file { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.msg-file-link { text-decoration: none; color: inherit; display: block; }
.msg-file-icon { font-size: 24px; flex-shrink: 0; }
.msg-file-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.msg-file-name { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.msg-file-size { font-size: 11px; color: #909399; }
.message-item.self .msg-file-size { color: rgba(255,255,255,0.7); }

/* ─── Typing ─── */
.typing-indicator { align-self: flex-start; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #909399; padding: 4px 0; }
.typing-dots { display: flex; gap: 3px; }
.typing-dots i { width: 6px; height: 6px; border-radius: 50%; background: #c0c4cc; animation: typing-bounce 1.4s ease-in-out infinite; }
.typing-dots i:nth-child(2) { animation-delay: 0.2s; }
.typing-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
.typing-fade-enter-active, .typing-fade-leave-active { transition: opacity 0.25s; }
.typing-fade-enter-from, .typing-fade-leave-to { opacity: 0; }

/* ─── Input ─── */
.chat-input-area { flex-shrink: 0; padding: 8px 24px 12px; border-top: 1px solid #f2f2f5; }
.input-toolbar { display: flex; align-items: center; gap: 8px; padding-bottom: 8px; }
.upload-spin { color: #409eff; font-size: 18px; }
.chat-input-area :deep(.el-textarea__inner) { resize: none; }
.chat-input-area { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
.chat-input-area > :deep(.el-textarea) { flex: 1; min-width: 0; }
.chat-input-area > .el-button { height: 40px; flex-shrink: 0; }

/* ─── Empty ─── */
.chat-empty { flex: 1; display: flex; align-items: center; justify-content: center; }

@media (max-width: 768px) {
  .chat-page { position: relative; overflow: hidden; }
  .chat-sidebar { width: 100% !important; }
  .chat-main { width: 100%; }

  .mobile-hidden { display: none !important; }
  .mobile-full { display: flex !important; }

  .back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border: none; background: none;
    color: #606266; cursor: pointer; border-radius: 50%;
    transition: background 0.2s; margin-right: 4px;
  }
  .back-btn:hover { background: #f0f0f0; }

  .chat-messages { padding: 12px 16px; }
  .message-item { max-width: 85%; }
  .chat-input-area { padding: 8px 16px 12px; }
  .msg-image { max-width: 180px; max-height: 180px; }
}
</style>
