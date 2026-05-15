<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getToken, getUser } from '@/utils/auth'
import { io } from 'socket.io-client'
import { getContacts, getChatMessages } from '@/api/message'
import { Search, Loading } from '@element-plus/icons-vue'
import gsap from 'gsap'
import { ElMessage } from 'element-plus'

// ─── current user ────────────────────────────────────────────────
const currentUser = getUser()
const currentUserId = currentUser?.id

// ─── contacts ────────────────────────────────────────────────────
const contacts = ref([])
const searchQuery = ref('')
const contactListRef = ref(null)

const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value
  const q = searchQuery.value.toLowerCase()
  return contacts.value.filter(
    (c) => c.name && c.name.toLowerCase().includes(q)
  )
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

// ─── typing indicator ───────────────────────────────────────────
const typingUsers = reactive({})
const typingTimeouts = {}

// ─── socket ──────────────────────────────────────────────────────
let socket = null
let typingTimer = null

// ─── gsap context ────────────────────────────────────────────────
let gsapCtx = null

// ─── helpers ─────────────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function truncate(str, len = 20) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

function isSelf(senderId) {
  return senderId === currentUserId || senderId === 0 || senderId === 'self'
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// ─── data loading ────────────────────────────────────────────────
async function loadContacts() {
  try {
    const res = await getContacts()
    contacts.value = res.data?.rows || res.data || []
  } catch {
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
    const list = res.data?.rows || res.data || []

    // Messages come in reverse-chronological from server; reverse for display
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

  // Mark previous chat messages as read
  markCurrentAsRead()

  activeContactId.value = contact.id
  contact.unreadCount = 0
  messages.value = []

  loadMessages(contact.id)
}

function markCurrentAsRead() {
  if (!activeContactId.value || !socket) return
  const unreadIds = messages.value
    .filter((m) => !isSelf(m.senderId) && !m.read)
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
  })

  // Optimistic insert
  const tempMsg = {
    id: 'temp_' + Date.now(),
    senderId: currentUserId,
    receiverId: activeContactId.value,
    content: text,
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

// ─── typing indicator ────────────────────────────────────────────
function handleTyping() {
  if (!socket || !activeContactId.value) return
  if (typingTimer) return // throttled — at most once per 2 s

  socket.emit('chat:typing', { receiverId: activeContactId.value })
  typingTimer = setTimeout(() => {
    typingTimer = null
  }, 2000)
}

// ─── infinite scroll ─────────────────────────────────────────────
function handleScroll(e) {
  const el = e.target
  if (
    el.scrollTop <= 30 &&
    hasMore.value &&
    !loadingHistory.value &&
    activeContactId.value
  ) {
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
    gsap.from(last, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.out',
    })
  }
}

// ─── lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  await loadContacts()

  await nextTick()
  // Stagger contact list items in
  if (contactListRef.value) {
    gsapCtx = gsap.context(() => {
      gsap.from('.contact-item', {
        opacity: 0,
        x: -30,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
      })
    }, contactListRef.value)
  }

  // ─── WebSocket ───────────────────────────────────────────────
  socket = io('http://localhost:3000', {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect_error', () => {
    ElMessage.error('聊天服务连接失败')
  })

  // Incoming message
  socket.on('chat:message', (msg) => {
    // If this is our own echoed message, replace the temp
    if (msg.senderId === currentUserId) {
      const idx = messages.value.findIndex(
        (m) =>
          typeof m.id === 'string' &&
          m.id.startsWith('temp_') &&
          m.content === msg.content
      )
      if (idx !== -1) {
        messages.value[idx] = { ...msg, sending: false }
        return
      }
      // If no temp found, still add (unlikely race condition)
    }

    // Message from a contact
    const contact = contacts.value.find((c) => c.id === msg.senderId)

    if (contact) {
      // Update last-message preview
      contact.lastMessage = msg.content
      contact.lastMessageTime = msg.createdAt

      if (activeContactId.value === msg.senderId) {
        // In active chat — append
        messages.value.push(msg)
        nextTick(() => {
          scrollToBottom()
          animateNewMessage()
        })
        // Auto mark as read
        socket.emit('chat:read', { messageIds: [msg.id] })
      } else {
        // In another chat or no chat open — bump unread count
        contact.unreadCount = (contact.unreadCount || 0) + 1
      }
    }
  })

  // Typing indicator from others
  socket.on('chat:typing', ({ senderId }) => {
    typingUsers[senderId] = true

    if (typingTimeouts[senderId]) {
      clearTimeout(typingTimeouts[senderId])
    }
    typingTimeouts[senderId] = setTimeout(() => {
      typingUsers[senderId] = false
      delete typingTimeouts[senderId]
    }, 3000)
  })

  // Online / offline status
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
  if (socket) {
    socket.disconnect()
    socket = null
  }
  if (gsapCtx) {
    gsapCtx.revert()
    gsapCtx = null
  }
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
  Object.values(typingTimeouts).forEach((t) => clearTimeout(t))
})
</script>

<template>
  <div class="chat-page">
    <FadeContent>
    <!-- ══════════════════ Left: Contact List ══════════════════ -->
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <span>联系人</span>
      </div>

      <div class="sidebar-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索联系人"
          :prefix-icon="Search"
          clearable
        />
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
            <span
              class="online-dot"
              :class="{ online: contact.online }"
            ></span>
          </div>

          <div class="contact-info">
            <div class="contact-top">
              <span class="contact-name">{{ contact.name }}</span>
              <el-tag
                size="small"
                :type="contact.role === 'admin' ? 'danger' : ''"
              >
                {{ contact.role === 'admin' ? '管理员' : '班主任' }}
              </el-tag>
            </div>
            <div class="contact-bottom">
              <span class="contact-preview">{{ truncate(contact.lastMessage) }}</span>
              <span class="contact-time">{{ formatTime(contact.lastMessageTime) }}</span>
            </div>
          </div>

          <el-badge
            :value="contact.unreadCount"
            :hidden="!contact.unreadCount"
            :max="99"
            class="unread-badge"
          />
        </div>

        <el-empty
          v-if="!filteredContacts.length"
          description="暂无联系人"
          :image-size="80"
        />
      </div>
    </aside>

    <!-- ══════════════════ Right: Chat Area ════════════════════ -->
    <main class="chat-main">
      <template v-if="activeContact">
        <!-- Header -->
        <header class="chat-header">
          <div class="chat-header-left">
            <el-avatar :src="activeContact.avatar" :size="36">
              {{ activeContact.name ? activeContact.name.charAt(0) : '' }}
            </el-avatar>
            <div class="chat-header-info">
              <span class="chat-header-name">{{ activeContact.name }}</span>
              <span
                class="chat-header-status"
                :class="{ online: activeContact.online }"
              >
                {{ activeContact.online ? '在线' : '离线' }}
              </span>
            </div>
          </div>
        </header>

        <!-- Messages -->
        <div
          ref="messagesRef"
          class="chat-messages"
          @scroll="handleScroll"
        >
          <!-- loading history -->
          <div v-if="loadingHistory" class="history-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <!-- no more history -->
          <div v-if="!hasMore && messages.length" class="history-end">
            没有更多消息了
          </div>

          <!-- initial loading -->
          <div v-if="loadingMessages" class="messages-loading">
            <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          </div>

          <!-- empty -->
          <div
            v-else-if="!messages.length && !loadingHistory"
            class="messages-empty"
          >
            <el-empty description="暂无消息" :image-size="100" />
          </div>

          <!-- message list -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item"
            :class="{ self: isSelf(msg.senderId) }"
          >
            <div class="message-bubble">
              <template v-if="msg.sending">
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time sending">发送中...</div>
              </template>
              <template v-else>
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
              </template>
            </div>
          </div>

          <!-- typing indicator -->
          <Transition name="typing-fade">
            <div
              v-if="typingUsers[activeContactId]"
              class="typing-indicator"
            >
              <span class="typing-dots">
                <i></i><i></i><i></i>
              </span>
              <span>对方正在输入...</span>
            </div>
          </Transition>
        </div>

        <!-- Input Area -->
        <footer class="chat-input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            resize="none"
            @keydown="handleKeydown"
            @input="handleTyping"
          />
          <el-button
            type="primary"
            :disabled="!inputText.trim()"
            @click="sendMessage"
          >
            发送
          </el-button>
        </footer>
      </template>

      <!-- Empty state: no contact selected -->
      <div v-else class="chat-empty">
        <el-empty
          description="选择一个联系人开始聊天"
          :image-size="160"
        />
      </div>
    </main>
    </FadeContent>
  </div>
</template>

<style scoped>
/* ═══════════════ Layout ═══════════════ */
.chat-page {
  display: flex;
  height: calc(100vh - var(--header-height, 56px));
  background: var(--color-bg, #f5f7fa);
}

/* ═══════════════ Left Sidebar ═══════════════ */
.chat-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid var(--color-border, #dcdfe6);
}

.sidebar-header {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #f2f2f5;
  flex-shrink: 0;
}

.sidebar-search {
  padding: 12px 16px;
  flex-shrink: 0;
}

/* ─── Contact List ─── */
.contact-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.contact-item:hover {
  background: #f5f7fa;
}

.contact-item.active {
  background: #ecf5ff;
}

.contact-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c0c4cc;
  border: 2px solid #fff;
}

.online-dot.online {
  background: #67c23a;
}

.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.contact-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-top .el-tag {
  flex-shrink: 0;
}

.contact-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-preview {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.contact-time {
  font-size: 11px;
  color: #c0c4cc;
  flex-shrink: 0;
}

.unread-badge {
  position: absolute;
  top: 8px;
  right: 12px;
}

/* ═══════════════ Right: Chat Main ═══════════════ */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

/* ─── Chat Header ─── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #f2f2f5;
  flex-shrink: 0;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-header-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chat-header-status {
  font-size: 12px;
  color: #c0c4cc;
}

.chat-header-status.online {
  color: #67c23a;
}

/* ─── Messages Area ─── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-loading,
.history-end {
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.messages-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #c0c4cc;
}

.messages-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* ─── Message Bubble ─── */
.message-item {
  display: flex;
  max-width: 70%;
}

.message-item.self {
  align-self: flex-end;
}

.message-item:not(.self) {
  align-self: flex-start;
}

.message-bubble {
  padding: 10px 16px;
  border-radius: 12px;
  word-break: break-word;
}

.message-item:not(.self) .message-bubble {
  background: #f2f3f5;
  border-bottom-left-radius: 4px;
}

.message-item.self .message-bubble {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  text-align: right;
}

.message-item:not(.self) .message-time {
  color: #c0c4cc;
}

.message-item.self .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-time.sending {
  font-style: italic;
}

/* ─── Typing Indicator ─── */
.typing-indicator {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
  padding: 4px 0;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c0c4cc;
  display: inline-block;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dots i:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: opacity 0.25s ease;
}

.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
}

/* ─── Input Area ─── */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 24px;
  border-top: 1px solid #f2f2f5;
  flex-shrink: 0;
}

.chat-input-area :deep(.el-textarea__inner) {
  resize: none;
}

.chat-input-area .el-button {
  height: 40px;
  flex-shrink: 0;
}

/* ─── Empty State ─── */
.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══════════════ Responsive ═══════════════ */
@media (max-width: 768px) {
  .chat-sidebar {
    width: 260px;
  }

  .chat-messages {
    padding: 12px 16px;
  }

  .message-item {
    max-width: 85%;
  }

  .chat-input-area {
    padding: 10px 16px;
  }
}
</style>
