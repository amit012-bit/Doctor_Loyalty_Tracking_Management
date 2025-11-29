# Git Configuration for This Repository

## To configure a different git user for THIS repository only (not global):

```bash
# Set user name for this repo only
git config --local user.name "Your Name"

# Set user email for this repo only  
git config --local user.email "your.email@example.com"

# Verify the configuration
git config user.name
git config user.email
```

## To configure authentication for pushing:

### Option 1: Using Personal Access Token (Recommended)
```bash
# Update remote URL to include token
git remote set-url origin https://<YOUR_TOKEN>@github.com/amit012-bit/Doctor_Loyalty_Tracking_Management.git

# Or use your GitHub username with token
git remote set-url origin https://<YOUR_USERNAME>:<YOUR_TOKEN>@github.com/amit012-bit/Doctor_Loyalty_Tracking_Management.git
```

### Option 2: Configure Git Credential Helper
```bash
# Store credentials
git config credential.helper store

# Or use cache (credentials stored in memory for a few minutes)
git config credential.helper cache
```

## To push changes:

```bash
# Stage all changes
git add .

# Commit with a message
git commit -m "Your commit message here"

# Push to current branch
git push origin feature/database-integration
```

## Check current configuration:
```bash
# Check local config (this repo only)
git config --local --list

# Check global config (all repos)
git config --global --list

# Check which config is being used
git config user.name
git config user.email
```

