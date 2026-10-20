-- Short Fuse content, taken word for word from the ConvertKit sequence "14-Day RAM Lead Gen" (2203286).
-- Videos go in with status 'course': the player and progress tracking work, and the Library
-- (which lists status 'active' only) doesn't show them. Inserted directly, so no member email goes out.
BEGIN;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-01', $kyn$Short Fuse Day 1: Acknowledge Your Anger$kyn$, NULL, 'https://youtu.be/zgzAaGmFInA', 'zgzAaGmFInA', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 1, $kyn$Acknowledge Your Anger$kyn$, $kyn$Nice to meet you 😃
Welcome to a life beyond anger.
You may not know it yet, but you have just started a truly long-lasting, life-changing journey.
Thank you for trusting me with your time and energy.
I am confident you’ll be pleased that you did.
I’ve been in some dark places, and my anger i.e. my life perspective, played a big role in taking me there.
Everything I share is from experience, and I'm now grateful for my darkest times because it’s what has helped me help others find their light.
Like with anything, you get out what you put in.
You cannot improve your life if you do not put the work in that life requires.
That being said, I have made the work as easy as possible by cutting out the faff, keeping the sessions short, concise, and practical.
Your work starts here: FREE 14-DAY REALISTIC ANGER MANAGEMENT PROGRAMME
GET STARTED TODAY - Gift yourself 5 minutes to start this work and keep up with supporting emails you'll get each day.
All sessions will show up right here in your inbox.
Remember, this is only the beginning of your path... But don’t worry, I’ve got you.
Check your email inbox every days to stay engaged and up to date, because the real work is what you do before and after each session you watch.$kyn$, 'course-short-fuse-01', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-02', $kyn$Short Fuse Day 2: Understand the Role of Anger$kyn$, NULL, 'https://youtu.be/c7XiJWWGdeI', 'c7XiJWWGdeI', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 2, $kyn$Understand the Role of Anger$kyn$, $kyn$Time for Day 2:
Understand the Role of Anger
In this lesson, we’ll cover:
• How anger acts as a signal that something feels wrong.
• Recognising the triggers and moments that cause anger to arise.
• Beginning to track and note when anger surfaces.$kyn$, 'course-short-fuse-02', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-03', $kyn$Short Fuse Day 3: Observe Without Judgement$kyn$, NULL, 'https://youtu.be/9-haOwvD9Zg', '9-haOwvD9Zg', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 3, $kyn$Observe Without Judgement$kyn$, $kyn$Time for Day 3:
Observe Without Judgement
In this lesson, we’ll cover:
•The practice of observing your anger without reacting or judging.
• Noticing physical sensations (like tension or heat) and thoughts connected to anger.
• Building awareness to better understand your emotional state.$kyn$, 'course-short-fuse-03', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-04', $kyn$Short Fuse Day 4: Identify Patterns and Triggers$kyn$, NULL, 'https://youtu.be/q5vs3ygGRs4', 'q5vs3ygGRs4', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 4, $kyn$Identify Patterns and Triggers$kyn$, $kyn$Time for Day 4:
Identify Patterns and Triggers
In this lesson, we’ll cover:
• Pinpointing situations or interactions that frequently ignite your anger.
• Reflecting on patterns, such as feeling disrespected or unheard.
• Gaining insights into what fuels your emotional responses.$kyn$, 'course-short-fuse-04', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-05', $kyn$Short Fuse Day 5: Separate Anger from Action$kyn$, NULL, 'https://youtu.be/66IQ6csoxl4', '66IQ6csoxl4', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 5, $kyn$Separate Anger from Action$kyn$, $kyn$Time for Day 5:
Separate Anger from Action
In this lesson, we’ll cover:
• Understanding that anger is a feeling, but acting on it is a choice.
• Learning to create a pause between experiencing anger and reacting to it.
• Building the skill to choose more thoughtful responses.$kyn$, 'course-short-fuse-05', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-06', $kyn$Short Fuse Day 6: Reflect on the Impact of Anger$kyn$, NULL, 'https://youtu.be/KPsTW6bYq40', 'KPsTW6bYq40', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 6, $kyn$Reflect on the Impact of Anger$kyn$, $kyn$Time for Day 6:
Reflect on the Impact of Anger
In this lesson, we’ll cover:
• Examining how unchecked anger has affected your relationships, work, and health.
• Understanding the broader consequences of unmanaged anger.
• Identifying areas where you’d like to see positive change.$kyn$, 'course-short-fuse-06', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-07', $kyn$Short Fuse Day 7: Ground Yourself in the Moment$kyn$, NULL, 'https://youtu.be/sqlUHCpml-M', 'sqlUHCpml-M', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 7, $kyn$Ground Yourself in the Moment$kyn$, $kyn$Time for Day 7:
Ground Yourself in the Moment
In this lesson, we’ll cover:
• Recognising how anger manifests in your body.
• Learning grounding techniques, such as deep breathing and simple exercises, to calm yourself.
• Reconnecting with a sense of control and clarity.$kyn$, 'course-short-fuse-07', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-08', $kyn$Short Fuse Day 8: Set Boundaries for Emotional Wellbeing$kyn$, NULL, 'https://youtu.be/MtyzjoAfGG4', 'MtyzjoAfGG4', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 8, $kyn$Set Boundaries for Emotional Wellbeing$kyn$, $kyn$Time for Day 8:
Set Boundaries for Emotional Wellbeing
In this lesson, we’ll cover:
• Understanding the importance of setting boundaries to protect your emotions.
• Identifying where boundaries are needed to prevent future anger.
• Creating a safe emotional space for yourself and others.$kyn$, 'course-short-fuse-08', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-09', $kyn$Short Fuse Day 9: Build Emotional Awareness$kyn$, NULL, 'https://youtu.be/LcKyjjsRdj4', 'LcKyjjsRdj4', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 9, $kyn$Build Emotional Awareness$kyn$, $kyn$Time for Day 9:
Build Emotional Awareness
in the video we'll cover:
• Understanding What’s Beneath the Surface
• Uncover the deeper emotions that anger often hides, such as frustration, sadness, or fear.
• Understanding these layers can help you respond more compassionately.$kyn$, 'course-short-fuse-09', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-10', $kyn$Short Fuse Day 10: Practice Self-Compassion$kyn$, NULL, 'https://youtu.be/fQrbFRaKy5Q', 'fQrbFRaKy5Q', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 10, $kyn$Practice Self-Compassion$kyn$, $kyn$Time for Day 10:
Practice Self-Compassion
In this lesson, we’ll cover:
• Letting go of guilt over past mistakes in managing anger.
• Embracing self-compassion as you move forward with new tools and perspectives.
• Recognising that personal growth is a process, and progress matters more than perfection.$kyn$, 'course-short-fuse-10', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-11', $kyn$Short Fuse Day 11: Release Stored Anger Safely$kyn$, NULL, 'https://youtu.be/__6jSaByaAk', '__6jSaByaAk', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 11, $kyn$Release Stored Anger Safely$kyn$, $kyn$Time for Day 11:
Release Stored Anger Safely
In this lesson, we’ll cover:
• Discovering healthy outlets for releasing pent-up anger, such as physical activity or journaling.
• Learning to let go of anger without harming yourself or others.
• Creating habits to keep your emotions in balance.$kyn$, 'course-short-fuse-11', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-12', $kyn$Short Fuse Day 12: Forgive Yourself and Others$kyn$, NULL, 'https://youtu.be/XNbQ7NovW58', 'XNbQ7NovW58', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 12, $kyn$Forgive Yourself and Others$kyn$, $kyn$Time for Day 12:
Forgive Yourself and Others
In this lesson, we’ll cover:
• Understanding forgiveness as a way to free yourself from resentment.
• Recognising that forgiveness isn’t about excusing bad behaviour—it’s about reclaiming your peace of mind.
• Taking steps to release grudges and emotional burdens.$kyn$, 'course-short-fuse-12', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-13', $kyn$Short Fuse Day 13: Develop Your Anger Action Plan$kyn$, NULL, 'https://youtu.be/6U0T1v9QbDw', '6U0T1v9QbDw', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 13, $kyn$Develop Your Anger Action Plan$kyn$, $kyn$Time for Day 13:
Develop Your Anger Action Plan
In this lesson, we’ll cover:
• Building a simple, personalised plan to manage anger effectively.
• Listing your go-to tools and strategies for when anger arises.
• Feeling prepared and confident to handle future challenges.$kyn$, 'course-short-fuse-13', NULL)
ON CONFLICT (course, day) DO NOTHING;
INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "updatedAt")
VALUES ('course-short-fuse-14', $kyn$Short Fuse Day 14: Reflect and Commit$kyn$, NULL, 'https://youtu.be/gqu-mHcPrXM', 'gqu-mHcPrXM', 'Short Fuse', NULL, 'course', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_days (course, day, title, body, video_id, pdf_url)
VALUES ('short-fuse', 14, $kyn$Reflect and Commit$kyn$, $kyn$Time for Day 14:
Reflect and Commit
In this lesson, we’ll cover:
• Reflecting on your journey over the past 14 days and celebrating your progress.
• Acknowledging how far you’ve come in understanding and managing your anger.
• Committing to continue these practices for lasting change.$kyn$, 'course-short-fuse-14', NULL)
ON CONFLICT (course, day) DO NOTHING;
COMMIT;
