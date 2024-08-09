CREATE DEFINER=`root`@`localhost` PROCEDURE `archieving_posts`()
BEGIN
    INSERT INTO archieved_posts (post_id, user_id, title, body, created_at)
    SELECT id, user_id, title, body, created_at
    FROM posts
    WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1;

    UPDATE comments, archieved_posts, posts
    SET comments.post_id = NULL, comments.archieved = 1, comments.archieved_id = archieved_posts.id 
    WHERE posts.id = archieved_posts.post_id;

    DELETE FROM posts
    WHERE id IS NOT NULL AND TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1;
END
