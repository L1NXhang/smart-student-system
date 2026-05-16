-- Add compound indexes for chat performance
ALTER TABLE `chat_messages` ADD INDEX IF NOT EXISTS `idx_receiver_read` (`receiver_id`, `sender_id`, `is_read`);
ALTER TABLE `chat_messages` ADD INDEX IF NOT EXISTS `idx_conversation` (`sender_id`, `receiver_id`, `created_at` DESC);
