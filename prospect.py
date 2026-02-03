#!/usr/bin/env python3
"""
404-Redirect Marketplace - Prospect Hunter
Searches GitHub for repos with 404/dead link issues

Usage:
    python prospect.py --search "404" --max 50
    python prospect.py --search "dead link" --max 50
    python prospect.py --search "broken link" --max 50
"""

import requests
import json
import csv
import time
import argparse
from datetime import datetime, timedelta
from urllib.parse import urlparse

# GitHub Search API (no auth needed for low volume, but rate limited)
GITHUB_API = "https://api.github.com/search/issues"

HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    # Add this if you have a token (recommended):
    # "Authorization": "token YOUR_GITHUB_TOKEN"
}

def search_github_issues(query, max_results=50):
    """Search GitHub issues for 404/broken link mentions"""
    
    # Calculate date 90 days ago
    date_90_days_ago = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    
    # Build query: open issues mentioning query, created in last 90 days
    full_query = f'"{query}" in:body is:issue is:open created:>{date_90_days_ago}'
    
    prospects = []
    page = 1
    per_page = 30
    
    print(f"🔍 Searching for: {query}")
    print(f"📅 Filter: Issues from last 90 days")
    
    while len(prospects) < max_results:
        params = {
            "q": full_query,
            "sort": "updated",
            "order": "desc",
            "per_page": per_page,
            "page": page
        }
        
        try:
            response = requests.get(GITHUB_API, headers=HEADERS, params=params)
            
            if response.status_code == 403:
                print("⚠️  Rate limited. Wait 60 seconds or add a GitHub token...")
                time.sleep(60)
                continue
                
            response.raise_for_status()
            data = response.json()
            
            items = data.get("items", [])
            if not items:
                break
                
            for issue in items:
                repo_url = issue.get("repository_url", "")
                if not repo_url:
                    continue
                    
                # Extract repo info
                repo_name = repo_url.replace("https://api.github.com/repos/", "")
                
                prospect = {
                    "repo_name": repo_name,
                    "repo_url": f"https://github.com/{repo_name}",
                    "issue_url": issue.get("html_url", ""),
                    "issue_title": issue.get("title", ""),
                    "issue_number": issue.get("number", ""),
                    "contact_method": "issue_comment",  # Default
                    "has_github_pages": "unknown",
                    "estimated_404s": "unknown"
                }
                
                prospects.append(prospect)
                print(f"  ✓ Found: {repo_name} - {issue.get('title', '')[:50]}...")
                
                if len(prospects) >= max_results:
                    break
                    
            page += 1
            time.sleep(2)  # Be nice to the API
            
        except requests.RequestException as e:
            print(f"❌ Error: {e}")
            break
    
    return prospects[:max_results]

def check_github_pages(prospect):
    """Check if repo has GitHub Pages enabled"""
    repo_name = prospect["repo_name"]
    
    # Common GitHub Pages URLs
    possible_urls = [
        f"https://{repo_name.split('/')[0]}.github.io/{repo_name.split('/')[1]}",
        f"https://{repo_name.split('/')[0]}.github.io",
    ]
    
    for url in possible_urls:
        try:
            response = requests.head(url, timeout=5, allow_redirects=True)
            if response.status_code == 200:
                prospect["gh_pages_url"] = url
                prospect["has_github_pages"] = "yes"
                return True
        except:
            continue
    
    prospect["has_github_pages"] = "no"
    return False

def generate_outreach_email(prospect, your_name="You"):
    """Generate personalized outreach email"""
    
    repo_owner = prospect["repo_name"].split("/")[0]
    
    email = f"""Hey {repo_owner},

Saw your issue #{prospect['issue_number']} about dead links — quick win?

I built something that turns 404 traffic into tip-jar money using Buy Me a Coffee. One line of JavaScript, 30-second setup.

Demo (30s): [YOUR_LOOM_LINK_HERE]
Live example: [YOUR_GITHUB_PAGES_LINK]/lost.html

Roughly how many 404s do you serve per month? If it's >100, I'll set this up on your site free.

Cheers,
{your_name}
"""
    return email

def save_to_csv(prospects, filename="prospects.csv"):
    """Save prospects to CSV for mail merge"""
    
    if not prospects:
        print("No prospects to save.")
        return
        
    fieldnames = ["repo_name", "repo_url", "issue_url", "issue_title", 
                  "issue_number", "contact_method", "has_github_pages", 
                  "gh_pages_url", "estimated_404s", "email_body"]
    
    # Add email bodies
    for p in prospects:
        p["email_body"] = generate_outreach_email(p)
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(prospects)
    
    print(f"\n✅ Saved {len(prospects)} prospects to {filename}")

def main():
    parser = argparse.ArgumentParser(description="Find 404-Redirect prospects on GitHub")
    parser.add_argument("--search", default="404", help="Search term (404, 'dead link', 'broken link')")
    parser.add_argument("--max", type=int, default=50, help="Max results to fetch")
    parser.add_argument("--check-pages", action="store_true", help="Check for GitHub Pages (slower)")
    args = parser.parse_args()
    
    print("=" * 60)
    print("404-REDIRECT MARKETPLACE - PROSPECT HUNTER")
    print("=" * 60)
    
    # Search
    prospects = search_github_issues(args.search, args.max)
    
    if not prospects:
        print("\n❌ No prospects found. Try a different search term.")
        return
    
    print(f"\n📊 Found {len(prospects)} prospects")
    
    # Optional: Check GitHub Pages
    if args.check_pages:
        print("\n🔍 Checking GitHub Pages (this may take a while)...")
        for i, p in enumerate(prospects):
            check_github_pages(p)
            print(f"  [{i+1}/{len(prospects)}] {p['repo_name']}: {p['has_github_pages']}")
            time.sleep(1)
    
    # Save
    filename = f"prospects_{args.search.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.csv"
    save_to_csv(prospects, filename)
    
    # Print sample
    print("\n" + "=" * 60)
    print("SAMPLE OUTREACH EMAIL:")
    print("=" * 60)
    print(prospects[0]["email_body"])
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Open the CSV file")
    print("2. Visit each issue URL and leave a comment (or email if public)")
    print("3. Track replies in the 'estimated_404s' column")
    print("4. Stop when you get 10 positive responses or 48 hours pass")

if __name__ == "__main__":
    main()
