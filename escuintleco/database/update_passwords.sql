USE escuintleco_db;
UPDATE usuarios SET password = '$2b$10$1axg/vtcvHfjnYX.RSUeYer6D.laYM8/aXpSh9rCAR1gzI0bj3tJ.' WHERE username = 'admin';
UPDATE usuarios SET password = '$2b$10$jO5QeXjJ/.wT6jzRxMK0fOkJU3gdrJEnQGy.lUIAcKjpNBWmJZFW6' WHERE username = 'cajero1';
SELECT username, LEFT(password, 10) as inicio_hash FROM usuarios;
