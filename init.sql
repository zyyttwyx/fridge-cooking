-- 1. 用户表
CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `role` VARCHAR(20) DEFAULT 'USER' COMMENT '角色: USER-普通用户, ADMIN-管理员',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 食材标签表（用于用户勾选冰箱里有什么）
CREATE TABLE `biz_ingredient` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '食材ID',
  `name` VARCHAR(50) NOT NULL COMMENT '食材名称(如: 鸡蛋, 西红柿)',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '分类(如: 肉类, 蔬菜, 调料)',
  `quantity` VARCHAR(50) DEFAULT NULL COMMENT '数量(如: 500克, 2个)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食材标签表';

-- 3. 食谱表
CREATE TABLE `biz_recipe` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '食谱ID',
  `title` VARCHAR(100) NOT NULL COMMENT '食谱名称',
  `cover_img` VARCHAR(255) DEFAULT NULL COMMENT '食谱封面图',
  `description` TEXT COMMENT '食谱简介',
  `difficulty` VARCHAR(20) DEFAULT '中等' COMMENT '难度: 简单/中等/困难',
  `cook_time` VARCHAR(20) DEFAULT '30分钟' COMMENT '烹饪时长',
  `steps` TEXT COMMENT '具体烹饪步骤(JSON或文本)',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食谱表';

-- 4. 食谱-食材关联表（核心：盲盒匹配算法的底层）
CREATE TABLE `rel_recipe_ingredient` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT NOT NULL COMMENT '食谱ID',
  `ingredient_id` BIGINT NOT NULL COMMENT '食材ID',
  PRIMARY KEY (`id`),
  KEY `idx_recipe` (`recipe_id`),
  KEY `idx_ingredient` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食谱食材关联表';

-- 5. 商品表（轻量商城：卖调料、配菜）
CREATE TABLE `biz_goods` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `goods_name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
  `goods_img` VARCHAR(255) DEFAULT NULL COMMENT '商品图片',
  `detail` TEXT COMMENT '商品详情',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 6. 订单表
CREATE TABLE `biz_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT '订单总价',
  `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING-待支付, PAID-已支付, SHIPPED-已发货',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 7. 买菜备忘录表
CREATE TABLE `biz_memo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '备忘录ID',
  `content` VARCHAR(200) NOT NULL COMMENT '内容',
  `completed` TINYINT(1) DEFAULT 0 COMMENT '是否已完成: 0-未完成, 1-已完成',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='买菜备忘录表';