-- 给食材表添加过期日期字段
ALTER TABLE `biz_ingredient` ADD COLUMN `expire_date` DATE DEFAULT NULL COMMENT '过期日期' AFTER `quantity`;

-- 给食谱表添加营养字段
ALTER TABLE `biz_recipe` ADD COLUMN `calories` INT DEFAULT NULL COMMENT '卡路里(千卡)' AFTER `cook_time`;
ALTER TABLE `biz_recipe` ADD COLUMN `protein` DOUBLE DEFAULT NULL COMMENT '蛋白质(g)' AFTER `calories`;
ALTER TABLE `biz_recipe` ADD COLUMN `fat` DOUBLE DEFAULT NULL COMMENT '脂肪(g)' AFTER `protein`;
ALTER TABLE `biz_recipe` ADD COLUMN `carbs` DOUBLE DEFAULT NULL COMMENT '碳水化合物(g)' AFTER `fat`;

-- 创建收藏表
CREATE TABLE IF NOT EXISTS `biz_favorite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `recipe_id` BIGINT DEFAULT NULL COMMENT '食谱ID',
  `recipe_title` VARCHAR(200) DEFAULT NULL COMMENT '食谱名称',
  `recipe_desc` VARCHAR(500) DEFAULT NULL COMMENT '食谱描述',
  `difficulty` VARCHAR(20) DEFAULT NULL COMMENT '难度',
  `cook_time` VARCHAR(50) DEFAULT NULL COMMENT '烹饪时长',
  `calories` INT DEFAULT NULL COMMENT '卡路里',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_recipe_id` (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食谱收藏表';

-- 更新现有食谱的营养数据
UPDATE `biz_recipe` SET `calories` = 450, `protein` = 25, `fat` = 18, `carbs` = 45 WHERE `title` = '锅包肉';
UPDATE `biz_recipe` SET `calories` = 380, `protein` = 28, `fat` = 20, `carbs` = 25 WHERE `title` = '东北溜肉段';
UPDATE `biz_recipe` SET `calories` = 520, `protein` = 30, `fat` = 35, `carbs` = 20 WHERE `title` = '地三鲜';
UPDATE `biz_recipe` SET `calories` = 600, `protein` = 35, `fat` = 40, `carbs` = 30 WHERE `title` = '猪肉酸菜炖粉条';
UPDATE `biz_recipe` SET `calories` = 280, `protein` = 15, `fat` = 20, `carbs` = 10 WHERE `title` = '鸡蛋炒韭菜';
UPDATE `biz_recipe` SET `calories` = 420, `protein` = 20, `fat` = 25, `carbs` = 30 WHERE `title` = '白菜炖冻豆腐';
UPDATE `biz_recipe` SET `calories` = 350, `protein` = 22, `fat` = 18, `carbs` = 28 WHERE `title` = '尖椒干豆腐';
UPDATE `biz_recipe` SET `calories` = 550, `protein` = 28, `fat` = 30, `carbs` = 45 WHERE `title` = '排骨炖豆角';
UPDATE `biz_recipe` SET `calories` = 480, `protein` = 32, `fat` = 28, `carbs` = 25 WHERE `title` = '小鸡炖蘑菇';
UPDATE `biz_recipe` SET `calories` = 320, `protein` = 12, `fat` = 22, `carbs` = 22 WHERE `title` = '东北大拉皮';
UPDATE `biz_recipe` SET `calories` = 180, `protein` = 8, `fat` = 12, `carbs` = 15 WHERE `title` = '拍黄瓜';
UPDATE `biz_recipe` SET `calories` = 250, `protein` = 10, `fat` = 18, `carbs` = 18 WHERE `title` = '凉拌木耳';