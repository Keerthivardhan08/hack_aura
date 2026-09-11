import os
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from supabase import create_client, Client

# Initialize Supabase
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

# Initialize Scheduler
scheduler = BackgroundScheduler()

def send_deadline_notification(user_email: str, hackathon_name: str, hours_left: int):
    """Send deadline notification via Email"""
    if not os.getenv("SENDGRID_API_KEY"):
        print("SendGrid API key not configured, skipping email")
        return
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        message = Mail(
            from_email=os.getenv("FROM_EMAIL", "notifications@hackathon-os.com"),
            to_emails=user_email,
            subject=f"⏰ {hours_left} hours left: {hackathon_name} submission!",
            html_content=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Deadline Alert</h2>
                    <p>Only <strong>{hours_left} hours</strong> remain to submit your project for:</p>
                    <h3 style="color: #10b981;">{hackathon_name}</h3>
                    <p>Make sure to submit before it's too late!</p>
                    <a href="{os.getenv('APP_URL')}/dashboard" 
                       style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 8px; margin-top: 16px;">
                       Submit Your Project
                    </a>
                </div>
            """
        )
        sg.send(message)
        print(f"Deadline email sent to {user_email}")
    except Exception as e:
        print(f"Email error: {e}")

def check_deadlines():
    """
    Run every 5 minutes to check for upcoming deadlines
    Sends notifications at 24h, 6h, and 1h remaining
    """
    print("Checking deadlines...")
    
    now = datetime.utcnow()
    tomorrow = now + timedelta(hours=24)
    
    try:
        result = supabase.table("hackathons").select("*").gte(
            "submission_deadline", now.isoformat()
        ).lte("submission_deadline", tomorrow.isoformat()).execute()
        
        if not result.data:
            return
        
        for hackathon in result.data:
            deadline = datetime.fromisoformat(hackathon["submission_deadline"].replace("Z", "+00:00"))
            hours_left = (deadline - now).total_seconds() / 3600
            
            # Get team members
            teams = supabase.table("teams").select("id, name").eq("hackathon_id", hackathon["id"]).execute()
            
            for team in teams.data:
                # Get team members with user details
                members = supabase.table("team_members").select("user_id, users(email, name)").eq("team_id", team["id"]).execute()
                
                for member in members.data:
                    user = member.get("users", {})
                    email = user.get("email")
                    
                    if not email:
                        continue
                    
                    # Send at 24h, 6h, 1h (with small window to prevent duplicates)
                    if 24 <= hours_left < 24.1:
                        send_deadline_notification(email, hackathon["name"], int(hours_left))
                    elif 6 <= hours_left < 6.1:
                        send_deadline_notification(email, hackathon["name"], int(hours_left))
                    elif 1 <= hours_left < 1.1:
                        send_deadline_notification(email, hackathon["name"], int(hours_left))
                    
                    # In-app notification for all close deadlines
                    if hours_left <= 24:
                        supabase.table("notifications").insert({
                            "user_id": user.get("id"),
                            "title": "Deadline Approaching",
                            "message": f"{hackathon['name']} deadline in {int(hours_left)} hours",
                            "read": False,
                            "type": "deadline"
                        }).execute()
        
        print(f"Checked {len(result.data)} hackathons")
        
    except Exception as e:
        print(f"Deadline check error: {e}")

def start_scheduler():
    """Start the background scheduler"""
    # Run every 5 minutes
    scheduler.add_job(
        check_deadlines,
        CronTrigger(minute="*/5"),
        id="deadline_checker",
        replace_existing=True
    )
    scheduler.start()
    print("Scheduler started - checking deadlines every 5 minutes")

if __name__ == "__main__":
    start_scheduler()
    
    # Keep running
    import time
    while True:
        time.sleep(60)