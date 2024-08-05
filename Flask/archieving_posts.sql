CREATE DEFINER=`root`@`localhost` PROCEDURE `archieving_posts`()
BEGIN
insert into archieved_posts (post_id, user_id, title, body, created_at)
select * from posts
WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1;

-- ALTER TABLE `comments` DROP CONSTRAINT comments_ibfk_1;
-- ALTER TABLE `comments` ADD CONSTRAINT fk_change FOREIGN KEY (post_id) REFERENCES archieved_posts(id);

UPDATE comments, archieved_posts, posts
SET comments.post_id = NULL, comments.archieved = 1, comments.archieved_id = archieved_posts.id 
WHERE posts.id = archieved_posts.post_id;

DELETE FROM posts
WHERE id IS NOT NULL AND TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1;

END