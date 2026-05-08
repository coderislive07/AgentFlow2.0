-- AgentFlow Database Initialization
-- Run this script to set up the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for semantic search (optional)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    input TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    output JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    CONSTRAINT task_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Agent logs table
CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent VARCHAR(50) NOT NULL,
    message TEXT,
    status VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    output JSONB
);

-- Agent status table
CREATE TABLE IF NOT EXISTS agent_status (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent VARCHAR(50) NOT NULL,
    status VARCHAR(20),
    output JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, agent)
);

-- Memory store table
CREATE TABLE IF NOT EXISTS memory_store (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    memory_type VARCHAR(50),
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_task_id ON agent_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_status_task_id ON agent_status(task_id);
CREATE INDEX IF NOT EXISTS idx_memory_store_task_id ON memory_store(task_id);
CREATE INDEX IF NOT EXISTS idx_memory_store_type ON memory_store(memory_type);

-- Insert sample data (optional)
-- INSERT INTO tasks (input, status) VALUES ('Build a web application', 'pending');