-- =============================================
-- Thor 分布式文件传输平台 - 数据库初始化脚本
-- 模块：应用系统管理 (Application System)
-- =============================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS `thor` 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci 
COMMENT '雷神分布式文件传输平台';

USE `thor`;

-- 2. 创建用户 thor 并授权
CREATE USER IF NOT EXISTS 'thor'@'%' IDENTIFIED BY 'Thor@2026!';   -- 生产环境建议使用更强密码
CREATE USER IF NOT EXISTS 'thor'@'localhost' IDENTIFIED BY 'Thor@2026!';

GRANT ALL PRIVILEGES ON `thor`.* TO 'thor'@'%';
GRANT ALL PRIVILEGES ON `thor`.* TO 'thor'@'localhost';
FLUSH PRIVILEGES;

-- 3. 应用系统表 (app_system)
CREATE TABLE `app_system` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_code` VARCHAR(50) NOT NULL COMMENT '系统编码（唯一）',
    `app_name` VARCHAR(100) NOT NULL COMMENT '系统名称',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
    `update_by` VARCHAR(50) DEFAULT NULL COMMENT '更新人',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_app_code` (`app_code`),
    KEY `idx_status` (`status`),
    KEY `idx_app_name` (`app_name`)
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='应用系统配置表';

-- 4. 初始化测试数据
INSERT INTO `app_system` (`app_code`, `app_name`, `status`, `remark`, `create_by`) VALUES
('ZJKYH', '张家口银行', 1, '张家口银行核心系统', 'system'),
('ODS', 'ODS', 1, '数据仓库系统', 'system'),
('CORE', '核心交易系统', 1, '核心交易处理系统', 'system'),
('CBS', 'CBS核心系统', 1, '核心银行系统', 'system');

-- 5. 查看表结构
DESC `app_system`;