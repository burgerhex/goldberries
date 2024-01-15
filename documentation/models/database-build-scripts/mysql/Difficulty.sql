DROP TABLE IF EXISTS `Difficulty`;



-- ************************************** `Difficulty`

CREATE TABLE IF NOT EXISTS `Difficulty`
(
 `id`      int NOT NULL AUTO_INCREMENT ,
 `name`    varchar(32) NOT NULL ,
 `subtier` enum('high', 'mid', 'low', 'guard') NULL ,
 `sort`    int NOT NULL ,

PRIMARY KEY (`id`)
);
