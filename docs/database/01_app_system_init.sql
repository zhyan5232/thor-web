-- =============================================
-- Thor 分布式文件传输平台 - 应用系统管理模块
-- 数据库初始化脚本 (MySQL 8.0+)
-- =============================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS `thor`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `thor`;

-- =============================================
-- 2. 应用系统表 (sys_app_system)
-- =============================================
DROP TABLE IF EXISTS `sys_app_system`;
CREATE TABLE `sys_app_system` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `app_code`          VARCHAR(50)  NOT NULL COMMENT '应用系统编码 (唯一)',
    `app_name`          VARCHAR(100) NOT NULL COMMENT '应用系统名称',
    `status`            TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-停用',
    `remark`            VARCHAR(500)          DEFAULT NULL COMMENT '备注',
    
    `create_time`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by`         VARCHAR(50)           DEFAULT NULL COMMENT '创建人',
    `update_by`         VARCHAR(50)           DEFAULT NULL COMMENT '更新人',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_app_code` (`app_code`),
    KEY `idx_status` (`status`),
    KEY `idx_app_name` (`app_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用系统配置表';

-- =============================================
-- 3. 初始化测试数据
-- =============================================
INSERT INTO `sys_app_system` (`app_code`, `app_name`, `status`, `remark`, `create_by`) VALUES
('ZJKYH', '张家口银行', 1, '张家口银行核心应用系统', 'system'),
('ODS', 'ODS', 1, '数据仓库系统', 'system'),
('CORE', '核心交易系统', 1, '核心交易处理系统', 'system'),
('CBS', 'CBS核心系统', 1, '核心银行系统', 'system'),
('LMS', 'LMS贷款管理系统', 1, '贷款管理系统', 'system');

-- =============================================
-- 4. 查看表结构
-- =============================================
-- DESC sys_app_system;