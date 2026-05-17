ALTER TABLE chat_messages
ADD COLUMN message_type ENUM('text', 'image', 'file') NOT NULL DEFAULT 'text' AFTER content,
ADD COLUMN file_url VARCHAR(500) DEFAULT NULL AFTER message_type,
ADD COLUMN file_name VARCHAR(255) DEFAULT NULL AFTER file_url,
ADD COLUMN file_size INT DEFAULT NULL AFTER file_name,
MODIFY COLUMN content TEXT DEFAULT NULL;
