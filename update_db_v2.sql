-- 给食材表添加数量字段
ALTER TABLE `biz_ingredient` ADD COLUMN `quantity` VARCHAR(50) DEFAULT NULL COMMENT '数量(如: 500克, 2个)' AFTER `category`;

-- 创建买菜备忘录表
CREATE TABLE IF NOT EXISTS `biz_memo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '备忘录ID',
  `content` VARCHAR(200) NOT NULL COMMENT '内容',
  `completed` TINYINT(1) DEFAULT 0 COMMENT '是否已完成: 0-未完成, 1-已完成',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='买菜备忘录表';

-- 清空不需要的商城和订单数据（可选）
-- DELETE FROM biz_order;
-- DELETE FROM biz_goods;