@@ .. @@
 import { PrismaClient } from '@prisma/client';
+import { LogEvent, QueryEvent } from '@prisma/client/runtime/library';
 import { logger } from './logger.config';

@@ .. @@
       // Log database queries in development
       if (process.env.NODE_ENV === 'development') {
-        DatabaseConfig.instance.$on('query', (e) => {
+        DatabaseConfig.instance.$on('query', (e: QueryEvent) => {
           logger.debug('Database Query', {
             query: e.query,
             params: e.params,
@@ .. @@
       }

       // Log database errors
-      DatabaseConfig.instance.$on('error', (e) => {
+      DatabaseConfig.instance.$on('error', (e: LogEvent) => {
         logger.error('Database Error', {
           message: e.message,
           target: e.target,
@@ .. @@
       });

       // Log database info
-      DatabaseConfig.instance.$on('info', (e) => {
+      DatabaseConfig.instance.$on('info', (e: LogEvent) => {
         logger.info('Database Info', {
           message: e.message,
           target: e.target,
@@ .. @@
       });

       // Log database warnings
-      DatabaseConfig.instance.$on('warn', (e) => {
+      DatabaseConfig.instance.$on('warn', (e: LogEvent) => {
         logger.warn('Database Warning', {
           message: e.message,
           target: e.target,