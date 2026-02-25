# GitHub Setup Instructions

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `CapstoneWebsite` (or your preferred name)
   - **Description**: "Peer Helpers Program (PHP) - React Frontend"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

### Option 1: Using HTTPS (Recommended)

```bash
git remote add origin https://github.com/YOUR_USERNAME/CapstoneWebsite.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Option 2: Using SSH (If you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/CapstoneWebsite.git
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files there
3. The README.md will be displayed on the main page

## Troubleshooting

### If you get authentication errors:

1. **For HTTPS**: You may need to use a Personal Access Token instead of a password

   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` permissions
   - Use the token as your password when pushing

2. **For SSH**: Make sure your SSH key is added to GitHub
   - Go to GitHub Settings → SSH and GPG keys
   - Add your SSH key if you haven't already

### If you need to update the remote URL:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/CapstoneWebsite.git
```

## Future Updates

After making changes to your code:

```bash
git add .
git commit -m "Your commit message"
git push
```

## Useful Git Commands

- `git status` - Check the status of your repository
- `git log` - View commit history
- `git pull` - Pull latest changes from GitHub
- `git branch` - List all branches
- `git checkout -b branch-name` - Create and switch to a new branch
