-- Add many more achievements for users to unlock

-- Coding Milestones
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Coder Initiate', 'Solve 5 coding problems', 'code', 'problems_solved', 5, 75),
('Code Ninja', 'Solve 25 coding problems', 'code', 'problems_solved', 25, 300),
('Algorithm God', 'Solve 200 coding problems', 'crown', 'problems_solved', 200, 2500),
('Leetcode Legend', 'Solve 500 coding problems', 'trophy', 'problems_solved', 500, 10000),
('Bug Squasher', 'Solve 1000 coding problems', 'zap', 'problems_solved', 1000, 25000);

-- Application Milestones  
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Application Beginner', 'Track 5 job applications', 'target', 'applications', 5, 75),
('Application Pro', 'Track 50 job applications', 'star', 'applications', 50, 750),
('Application Master', 'Track 200 job applications', 'award', 'applications', 200, 3000),
('Job Search Warrior', 'Track 500 job applications', 'trophy', 'applications', 500, 10000);

-- Streak Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Getting Started', 'Maintain a 3-day streak', 'flame', 'streak', 3, 50),
('Two Weeks Strong', 'Maintain a 14-day streak', 'flame', 'streak', 14, 200),
('Marathon Runner', 'Maintain a 60-day streak', 'fire', 'streak', 60, 600),
('Year Long Journey', 'Maintain a 365-day streak', 'crown', 'streak', 365, 15000);

-- Level Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Newcomer', 'Reach level 2', 'star', 'level', 2, 50),
('Getting Serious', 'Reach level 3', 'star', 'level', 3, 75),
('Intermediate', 'Reach level 7', 'award', 'level', 7, 250),
('Advanced', 'Reach level 12', 'award', 'level', 12, 600),
('Master', 'Reach level 15', 'crown', 'level', 15, 1500),
('Grandmaster', 'Reach level 20', 'trophy', 'level', 20, 5000),
('Immortal', 'Reach level 25', 'trophy', 'level', 25, 10000);

-- Assessment Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Quiz Taker', 'Complete 1 assessment', 'target', 'assessments_completed', 1, 50),
('Quiz Enthusiast', 'Complete 5 assessments', 'award', 'assessments_completed', 5, 200),
('Assessment Pro', 'Complete 25 assessments', 'star', 'assessments_completed', 25, 750),
('Assessment Master', 'Complete 50 assessments', 'crown', 'assessments_completed', 50, 2000),
('Knowledge Seeker', 'Complete 100 assessments', 'trophy', 'assessments_completed', 100, 5000);

-- Perfect Score Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Perfectionist', 'Get 1 perfect score on an assessment', 'star', 'perfect_scores', 1, 100),
('Accuracy Master', 'Get 5 perfect scores on assessments', 'award', 'perfect_scores', 5, 500),
('Flawless', 'Get 10 perfect scores on assessments', 'crown', 'perfect_scores', 10, 1500);

-- Social/Connection Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('First Friend', 'Make your first connection', 'users', 'connections', 1, 25),
('Networker', 'Make 5 connections', 'users', 'connections', 5, 100),
('Social Pro', 'Make 25 connections', 'users', 'connections', 25, 500),
('Networking Legend', 'Make 100 connections', 'users', 'connections', 100, 2500);

-- Community Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('First Post', 'Create your first post', 'heart', 'posts_created', 1, 25),
('Content Creator', 'Create 10 posts', 'heart', 'posts_created', 10, 200),
('Influencer', 'Create 50 posts', 'star', 'posts_created', 50, 1000),
('Community Leader', 'Create 100 posts', 'crown', 'posts_created', 100, 3000);

-- Upvote Achievements  
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Appreciated', 'Receive 10 upvotes on your posts', 'heart', 'upvotes_received', 10, 100),
('Popular', 'Receive 50 upvotes on your posts', 'heart', 'upvotes_received', 50, 500),
('Viral', 'Receive 200 upvotes on your posts', 'star', 'upvotes_received', 200, 2000),
('Legendary Poster', 'Receive 1000 upvotes on your posts', 'trophy', 'upvotes_received', 1000, 10000);

-- Daily Task Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Task Starter', 'Complete 1 daily task', 'target', 'tasks_completed', 1, 25),
('Task Doer', 'Complete 10 daily tasks', 'target', 'tasks_completed', 10, 150),
('Task Champion', 'Complete 50 daily tasks', 'award', 'tasks_completed', 50, 750),
('Task Legend', 'Complete 200 daily tasks', 'crown', 'tasks_completed', 200, 3000);

-- XP Milestones
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('XP Hunter', 'Earn 500 total XP', 'zap', 'total_xp', 500, 50),
('XP Collector', 'Earn 2500 total XP', 'zap', 'total_xp', 2500, 150),
('XP Enthusiast', 'Earn 10000 total XP', 'star', 'total_xp', 10000, 500),
('XP Master', 'Earn 50000 total XP', 'crown', 'total_xp', 50000, 2000),
('XP Legend', 'Earn 100000 total XP', 'trophy', 'total_xp', 100000, 5000);

-- Offer Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('First Offer', 'Receive your first job offer', 'trophy', 'offers_received', 1, 1000),
('In Demand', 'Receive 3 job offers', 'crown', 'offers_received', 3, 3000),
('Hot Commodity', 'Receive 5 job offers', 'star', 'offers_received', 5, 5000),
('Offer Magnet', 'Receive 10 job offers', 'trophy', 'offers_received', 10, 15000);

-- Weekly Leaderboard Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Weekly Top 10', 'Finish in top 10 on weekly leaderboard', 'medal', 'weekly_top_10', 1, 500),
('Weekly Top 3', 'Finish in top 3 on weekly leaderboard', 'award', 'weekly_top_3', 1, 1000),
('Weekly Champion', 'Win the weekly leaderboard', 'crown', 'weekly_wins', 1, 2500),
('Repeat Champion', 'Win the weekly leaderboard 5 times', 'trophy', 'weekly_wins', 5, 10000);

-- Speed Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Speed Demon', 'Solve a problem in under 5 minutes', 'zap', 'fast_solves', 1, 100),
('Lightning Fast', 'Solve 10 problems in under 5 minutes each', 'zap', 'fast_solves', 10, 500),
('Flash', 'Solve 50 problems in under 5 minutes each', 'zap', 'fast_solves', 50, 2000);

-- Consistency Achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('Daily Warrior', 'Be active for 7 consecutive days', 'flame', 'active_days', 7, 150),
('Monthly Regular', 'Be active for 30 consecutive days', 'fire', 'active_days', 30, 500),
('Quarterly Champion', 'Be active for 90 consecutive days', 'star', 'active_days', 90, 1500);
