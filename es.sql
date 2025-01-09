-- MySQL dump 10.13  Distrib 8.1.0, for macos13 (arm64)
--
-- Host: localhost    Database: taskit
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_id` bigint NOT NULL,
  `message` text NOT NULL,
  `timestamp` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recipient_id` (`recipient_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (2,2,'string','string'),(3,2,'Your task has been updated: NEW TASK','2024-12-25T20:17:19.516618Z'),(4,2,'You have been added to this project: Tarik\'s Project','2024-12-25T20:17:43.811022Z'),(5,3,'You have been added to this project: Tarik\'s Project','2024-12-25T20:35:49.411550Z'),(6,1,'You have been added to this project: TESTING','2024-12-25T21:22:21.674149Z'),(7,2,'Your task has been updated: string','2024-12-25T21:25:52.663201Z'),(8,2,'Your task has been updated: aaa','2024-12-25T21:33:04.174931Z'),(9,9,'You have been assigned a task: ewew','2024-12-31T14:32:24.913155Z'),(10,8,'You have been assigned a task: a','2024-12-31T14:36:33.218340Z'),(11,2,'You have been assigned a task: asasas','2024-12-31T14:37:10.936422Z'),(12,1,'You have been assigned a task: dfdf','2024-12-31T14:37:32.047251Z'),(13,8,'You have been assigned a task: eds','2024-12-31T14:45:42.216331Z'),(14,8,'You have been assigned a task: ds','2024-12-31T14:46:10.010668Z'),(15,8,'You have been assigned a task: dsds','2024-12-31T14:47:31.881115Z'),(16,2,'You have been assigned a task: new task','2024-12-31T14:53:13.653386Z'),(17,9,'You have been assigned a task: rer','2024-12-31T14:56:50.683037Z'),(18,7,'You have been assigned a task: Task 1','2024-12-31T15:23:21.895426Z'),(19,7,'You have been assigned a task: asas','2024-12-31T15:49:52.705904Z'),(20,9,'You have been added to this project: Tarik\'s Project','2024-12-31T16:04:39.196586Z'),(21,9,'You have been assigned a task: some tasks','2024-12-31T16:05:24.989530Z'),(22,9,'You have been assigned a task: dsa','2024-12-31T16:05:59.649560Z'),(23,3,'You have been assigned a task: sda','2024-12-31T16:15:18.440017Z'),(24,3,'You have been assigned a task: sdadfa','2025-01-01T01:10:35.889584Z'),(25,3,'You have been assigned a task: fds','2025-01-01T01:15:05.614942Z'),(26,9,'You have been assigned a task: asd','2025-01-01T01:16:03.459492Z'),(27,9,'You have been assigned a task: sda','2025-01-01T01:20:17.890584Z');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `project_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES (1,1),(1,2),(7,2),(1,3),(7,3),(1,7),(1,8),(1,9),(7,9);
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'TESTING','Project Description',1),(5,'dsnd','fjosdnfowf',1),(7,'Tarik\'s Project','hahahahhanaljdfnaddds',8);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `assigned_to` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (24,'rer','eds','TO DO','High','2002-09-22 22:00:00.000000',9,1);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Tarik Maljanovic','tarik@gmail.com','123','ADMIN'),(2,'Melisa Geca','melisa@gmail.com','123','MEMBER'),(3,'Elma Krndzija','elma@gmail.com','123',NULL),(7,'Larisa Bajraktarevic','lara@gmail.com','123','MEMBER'),(8,'Tarik Maljanovic','tarikmaljanovic123@gmail.com','123','MEMBER'),(9,'Test User','test@gmail.com','123','MEMBER'),(10,'1','t@gmail.com','123','MEMBER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'taskit'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-05 16:23:22
