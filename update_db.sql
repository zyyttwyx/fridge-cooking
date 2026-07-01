-- 给食谱表添加难度和烹饪时长字段
ALTER TABLE `biz_recipe` ADD COLUMN `difficulty` VARCHAR(20) DEFAULT '中等' COMMENT '难度: 简单/中等/困难' AFTER `description`;
ALTER TABLE `biz_recipe` ADD COLUMN `cook_time` VARCHAR(20) DEFAULT '30分钟' COMMENT '烹饪时长' AFTER `difficulty`;

-- 更新食谱数据的难度和时长
UPDATE `biz_recipe` SET `difficulty` = '困难', `cook_time` = '1小时' WHERE `id` = 1;
UPDATE `biz_recipe` SET `difficulty` = '中等', `cook_time` = '40分钟' WHERE `id` = 2;
UPDATE `biz_recipe` SET `difficulty` = '中等', `cook_time` = '1小时' WHERE `id` = 3;
UPDATE `biz_recipe` SET `difficulty` = '中等', `cook_time` = '1小时' WHERE `id` = 4;
UPDATE `biz_recipe` SET `difficulty` = '简单', `cook_time` = '40分钟' WHERE `id` = 5;
UPDATE `biz_recipe` SET `difficulty` = '中等', `cook_time` = '40分钟' WHERE `id` = 6;
UPDATE `biz_recipe` SET `difficulty` = '中等', `cook_time` = '40分钟' WHERE `id` = 7;
UPDATE `biz_recipe` SET `difficulty` = '简单', `cook_time` = '20分钟' WHERE `id` = 8;
UPDATE `biz_recipe` SET `difficulty` = '简单', `cook_time` = '30分钟' WHERE `id` = 9;
UPDATE `biz_recipe` SET `difficulty` = '简单', `cook_time` = '30分钟' WHERE `id` = 10;
UPDATE `biz_recipe` SET `difficulty` = '简单', `cook_time` = '15分钟' WHERE `id` = 11;
UPDATE `biz_recipe` SET `difficulty` = '简单', `cook_time` = '15分钟' WHERE `id` = 12;
