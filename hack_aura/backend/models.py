# Database models for Hackathon OS
# These are the table structures needed for the call system

DATABASE_MODELS = {
    "hackathons": {
        "id": "UUID PRIMARY KEY",
        "name": "TEXT NOT NULL",
        "description": "TEXT",
        "organizer": "TEXT",
        "website": "TEXT",
        "submission_deadline": "TIMESTAMP WITH TIME ZONE",
        "themes": "TEXT[]",
        "tracks": "TEXT[]",
        "prizes": "TEXT[]",
        "logo": "TEXT",
        "status": "TEXT CHECK (status IN ('upcoming', 'active', 'completed'))",
        "created_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
    },
    "teams": {
        "id": "UUID PRIMARY KEY",
        "name": "TEXT NOT NULL",
        "hackathon_id": "UUID REFERENCES hackathons(id)",
        "created_by": "UUID REFERENCES auth.users(id)",
        "created_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
    },
    "team_members": {
        "id": "UUID PRIMARY KEY",
        "team_id": "UUID REFERENCES teams(id)",
        "user_id": "UUID REFERENCES auth.users(id)",
        "role": "TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member'))",
        "joined_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
    },
    "notifications": {
        "id": "UUID PRIMARY KEY",
        "user_id": "UUID REFERENCES auth.users(id)",
        "title": "TEXT NOT NULL",
        "message": "TEXT NOT NULL",
        "type": "TEXT CHECK (type IN ('deadline', 'update', 'general'))",
        "read": "BOOLEAN DEFAULT FALSE",
        "created_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
    },
    "calls": {
        "id": "UUID PRIMARY KEY",
        "team_id": "UUID REFERENCES teams(id)",
        "started_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
        "ended_at": "TIMESTAMP WITH TIME ZONE",
        "duration_seconds": "INTEGER",
        "participants": "INTEGER[]"
    }
}