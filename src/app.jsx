import React, { useState, useEffect, useRef, useCallback } from 'react';

// Main App component which contains all other components and logic.
function App() {
    // The comprehensive checklist content, now including platform-specific commands,
    // detailed pitfalls with solutions, and new sections as requested.
    // Each main section has an 'id', 'title', and 'sections' array.
    // Each 'section' (which is a step) has an 'id', 'title', 'description'.
    // 'contentBlocks' array within each step can contain 'command', 'pitfall', or 'text' types.
    const checklistContent = [
        {
            id: "prep-locally",
            title: "1. Prepare Locally",
            sections: [
                {
                    id: "install-python",
                    title: "1.1 Install Python & Virtual Environment",
                    description: "Ensure Python 3.x is installed and create a virtual environment for your project locally.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General',
                            commands: [
                                "sudo apt update",
                                "sudo apt install python3.9 python3.9-venv",
                                "python3.9 -m venv venv",
                                "source venv/bin/activate"
                            ],
                            description: "Commands to install Python 3.9 (if not already present) and set up a virtual environment on a local Ubuntu-like system."
                        },
                        {
                            type: 'pitfall',
                            title: 'Wrong Python version syntax (Path | None on Python 3.9)',
                            content: 'Using `Path | None` type hints might cause compatibility issues on Python 3.9, which doesn\'t fully support the `|` operator for union types in this context.',
                            fix: 'Use `Optional[Path]` from the `typing` module (e.g., `from typing import Optional`) or upgrade your local development environment to Python 3.10 or newer for native support of `|` for union types.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Forgetting to activate virtual environment',
                            content: 'Running `pip install` or `python` commands without activating the virtual environment first will install packages globally on your system, leading to dependency conflicts or unexpected behavior.',
                            fix: 'After creating the virtual environment with `python3.9 -m venv venv`, always run `source venv/bin/activate`. You\'ll know it\'s active when you see `(venv)` prepended to your terminal prompt. Then proceed with all package installations.'
                        },
                    ]
                },
                {
                    id: "install-dependencies",
                    title: "1.2 Install Project Dependencies",
                    description: "Install FastAPI, Uvicorn, and other project requirements within your local virtual environment.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General',
                            commands: [
                                "pip install fastapi uvicorn[standard] python-multipart",
                                "pip install -r requirements.txt"
                            ],
                            description: "Install core FastAPI dependencies and any additional project requirements specified in `requirements.txt`."
                        },
                        {
                            type: 'pitfall',
                            title: 'Missing critical packages',
                            content: 'If your `requirements.txt` is incomplete or essential packages like `fastapi` or `uvicorn` are not installed, your application may fail to start or run correctly, often with `ModuleNotFoundError`s.',
                            fix: 'Always ensure `pip install -r requirements.txt` is run after activating the virtual environment and that `requirements.txt` is up-to-date with all project dependencies, including any specific versions if needed.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Using `opencv-python` instead of `opencv-python-headless` on servers',
                            content: 'Installing the standard `opencv-python` package includes GUI dependencies that are typically unnecessary and can cause installation issues or bloat on headless servers (like EC2 instances).',
                            fix: 'For server deployments, always use `pip install opencv-python-headless` if your application requires OpenCV. For local development where GUI interactions might be needed, `opencv-python` is acceptable.'
                        },
                    ]
                }
            ]
        },
        {
            id: "launch-ec2",
            title: "2. Launch AWS EC2 Instance",
            sections: [
                {
                    id: "choose-ami",
                    title: "2.1 Choose AMI and Instance Type",
                    description: "Select an appropriate Amazon Machine Image (AMI) and instance type for your application on AWS EC2.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General',
                            commands: [
                                "AWS Console -> EC2 -> Instances -> Launch Instances",
                                "Select Ubuntu Server 20.04 LTS (HVM), SSD Volume Type (or newer LTS version)"
                            ],
                            description: "Steps for launching an EC2 instance using the AWS Console, typically starting with Ubuntu for familiar commands."
                        },
                        {
                            type: 'command',
                            platform: 'Amazon Linux 2023',
                            commands: [
                                "AWS Console -> EC2 -> Instances -> Launch Instances",
                                "Select Amazon Linux 2023 AMI"
                            ],
                            description: "Alternatively, select Amazon Linux 2023 for a modern, lightweight, and security-focused Linux distribution from AWS."
                        },
                        {
                            type: 'pitfall',
                            title: 'Choosing an undersized or oversized instance type',
                            content: 'Selecting an EC2 instance type (e.g., `t2.micro`, `t3.medium`) that is too small can lead to performance bottlenecks and application unresponsiveness. An oversized instance wastes money.',
                            fix: 'Start with a `t2.micro` or `t3.micro` for initial testing and small applications. Monitor CPU, memory, and network usage with CloudWatch, and scale up (e.g., to `t3.medium`) if your application demands more resources.'
                        },
                    ]
                },
                {
                    id: "configure-security-group",
                    title: "2.2 Configure Security Group",
                    description: "Set up inbound rules in your EC2 Security Group to control network traffic to your instance.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General',
                            commands: [
                                "Add Rule: Type SSH, Source My IP (or specific IP range)",
                                "Add Rule: Type HTTP, Source Anywhere (0.0.0.0/0)",
                                "Add Rule: Type HTTPS, Source Anywhere (0.0.0.0/0)",
                                "Add Rule: Type Custom TCP, Port Range 8000, Source Anywhere (0.0.0.0/0) - TEMPORARY"
                            ],
                            description: "Essential inbound rules for SSH, HTTP/S, and a temporary rule for direct Uvicorn testing on port 8000."
                        },
                        {
                            type: 'pitfall',
                            title: 'Incorrect security group rules blocking access',
                            content: 'Incorrectly configured inbound rules are the most common reason for "connection refused" or "timeout" errors when trying to access your EC2 instance or application.',
                            fix: 'Ensure port 22 (SSH), 80 (HTTP), and 443 (HTTPS) are open from appropriate sources (e.g., "My IP" for SSH, "Anywhere" for HTTP/S). For direct Uvicorn testing, temporarily open Custom TCP 8000 to "Anywhere". Remember to tighten rules later.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Can\'t reach application on port 8000',
                            content: 'If your FastAPI application is running on port 8000 but you cannot access it directly from your browser, the security group is likely blocking the traffic.',
                            fix: 'Temporarily add an inbound rule for `Custom TCP`, `Port 8000`, `Source: 0.0.0.0/0` in your EC2 Security Group. **Long-term solution:** Use Nginx as a reverse proxy on port 80/443 and close port 8000 to external traffic, only allowing localhost access.'
                        },
                    ]
                }
            ]
        },
        {
            id: "ssh-into-ec2",
            title: "3. SSH into EC2 Instance",
            sections: [
                {
                    id: "connect-ssh",
                    title: "3.1 Connect via SSH",
                    description: "Use your private key to securely connect to your newly launched EC2 instance.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Linux/macOS',
                            commands: [
                                "chmod 400 your-key.pem",
                                "ssh -i your-key.pem ubuntu@ec2-XX-XXX-XXX-XXX.compute-1.amazonaws.com"
                            ],
                            description: "Commands to set appropriate permissions on your SSH key and connect to an Ubuntu EC2 instance."
                        },
                        {
                            type: 'pitfall',
                            title: 'Permission denied (publickey) on Windows',
                            content: 'On Windows, improper file permissions on your `.pem` key file can lead to SSH `Permission denied (publickey)` errors.',
                            fix: 'Open PowerShell and run the following commands to restrict access to your key file:\n`icacls .\\key.pem /inheritance:r`\n`icacls .\\key.pem /grant:r "$env:USERNAME:(R)"`\n`icacls .\\key.pem /remove:g "Authenticated Users" "BUILTIN\\Administrators" "Users" "Everyone"`'
                        },
                        {
                            type: 'pitfall',
                            title: 'Using the wrong SSH username (IAM vs OS user)',
                            content: 'Attempting to SSH into an EC2 instance with an IAM user\'s name instead of the instance\'s default OS user will result in authentication failure.',
                            fix: 'Use the correct default OS username for your AMI: `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu, `centos` for CentOS, `admin` for Debian, etc. Check your AMI documentation if unsure.'
                        },
                    ]
                }
            ]
        },
        {
            id: "install-system-deps-ec2",
            title: "4. Install System Dependencies on EC2",
            description: "Install essential system-level packages on your EC2 instance before deploying your application.",
            sections: [
                {
                    id: "install-deps-ubuntu",
                    title: "4.1 Install Dependencies on Ubuntu",
                    description: "Install Python, Git, and Nginx on your Ubuntu EC2 instance.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Ubuntu',
                            commands: [
                                "sudo apt update -y",
                                "sudo apt install -y python3.9 python3.9-venv git nginx"
                            ],
                            description: "Update package lists and install Python 3.9 with venv, Git for cloning repositories, and Nginx for reverse proxying."
                        }
                    ]
                },
                {
                    id: "install-deps-amazon-linux",
                    title: "4.2 Install Dependencies on Amazon Linux 2023",
                    description: "Install Python, Git, and Nginx on your Amazon Linux 2023 EC2 instance.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Amazon Linux 2023',
                            commands: [
                                "sudo dnf update -y",
                                "sudo dnf install -y python3-pip python3-virtualenv git nginx"
                            ],
                            description: "Update package lists and install Python 3 with pip/virtualenv, Git, and Nginx using `dnf`."
                        }
                    ]
                }
            ]
        },
        {
            id: "deploy-app",
            title: "5. Deploy FastAPI Application",
            sections: [
                {
                    id: "get-code-onto-server",
                    title: "5.1 Get Code onto Server",
                    description: "Transfer your application code from your local machine or version control to the EC2 instance.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General (Git)',
                            commands: [
                                "git clone https://github.com/your-org/your-repo.git",
                                "cd your-repo"
                            ],
                            description: "Clone your application's Git repository to the EC2 instance. Ensure Git is installed."
                        },
                        {
                            type: 'command',
                            platform: 'General (SCP Alternative)',
                            commands: [
                                "scp -i key.pem main.py requirements.txt ec2-user@YOUR_EC2_IP:/home/ec2-user/app/"
                            ],
                            description: "Alternatively, use `scp` (Secure Copy Protocol) to transfer individual files or directories. Replace `ec2-user` with `ubuntu` for Ubuntu AMIs and update the path as needed."
                        },
                        {
                            type: 'pitfall',
                            title: 'Private repository clone fails',
                            content: 'If your repository is private, a simple `git clone` will fail due to authentication issues.',
                            fix: 'For private repositories, use a Personal Access Token (PAT) with HTTPS cloning, or configure SSH keys on your EC2 instance for SSH cloning. The `scp` method is a good alternative for small projects without complex Git history.'
                        },
                    ]
                },
                {
                    id: "install-deps-ec2",
                    title: "5.2 Install Python and Dependencies on EC2",
                    description: "Set up a virtual environment and install project-specific Python dependencies on the EC2 instance.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General',
                            commands: [
                                "python3.9 -m venv venv",
                                "source venv/bin/activate",
                                "pip install -r requirements.txt"
                            ],
                            description: "Create a virtual environment, activate it, and install all Python dependencies from `requirements.txt`."
                        },
                        {
                            type: 'pitfall',
                            title: 'Not using virtual environment on the server',
                            content: 'Installing Python packages globally on the server can lead to dependency conflicts with other system applications or Python versions.',
                            fix: 'Always create and activate a virtual environment (`venv`) for your FastAPI application on the EC2 instance. This isolates your project dependencies and prevents conflicts.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Missing `python-multipart` for `UploadFile`',
                            content: 'If your FastAPI application uses `UploadFile` (e.g., for file uploads), but `python-multipart` is not installed, you will encounter runtime errors when handling file uploads.',
                            fix: 'Ensure `python-multipart` is listed in your `requirements.txt` or explicitly install it with `pip install python-multipart` within your activated virtual environment.'
                        },
                    ]
                },
                {
                    id: "run-uvicorn",
                    title: "5.3 Run Uvicorn",
                    description: "Start your FastAPI application using Uvicorn directly.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General (Foreground)',
                            commands: [
                                "uvicorn main:app --host 0.0.0.0 --port 8000"
                            ],
                            description: "Run Uvicorn in the foreground. This is useful for initial testing, but the process will stop if your SSH session closes."
                        },
                        {
                            type: 'command',
                            platform: 'General (Background - nohup)',
                            commands: [
                                "nohup uvicorn main:app --host 0.0.0.0 --port 8000 &"
                            ],
                            description: "Run Uvicorn in the background using `nohup`. The `&` detaches the process from your terminal, allowing it to continue running after you close your SSH session. Output will go to `nohup.out` by default."
                        },
                        {
                            type: 'pitfall',
                            title: 'Application binds only to 127.0.0.1 (localhost)',
                            content: 'If Uvicorn is run without `--host 0.0.0.0`, it might default to `127.0.0.1`, making it inaccessible from outside the EC2 instance (even if security groups are open).',
                            fix: 'Always specify `--host 0.0.0.0` when running Uvicorn on a server. This makes the application listen on all available network interfaces, allowing external connections.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Port 8000 already in use',
                            content: 'If a previous instance of Uvicorn or another process is still using port 8000, your new Uvicorn process will fail to start, reporting "Address already in use".',
                            fix: 'Use `ss -ltnp | grep 8000` to identify the process using the port. Then, use `pkill -f "uvicorn main:app"` to terminate any stale Uvicorn processes. Alternatively, restart the EC2 instance if safe to do so.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Server stops when SSH session closes',
                            content: 'If you run Uvicorn directly without a process manager or `nohup`, the application will terminate as soon as you close your SSH terminal.',
                            fix: 'For simple cases, use `nohup uvicorn ... &` (as shown above). For production, it\'s highly recommended to use a proper process manager like Supervisord or Systemd to ensure your application runs reliably in the background and restarts automatically upon failure or server reboot.'
                        },
                    ]
                }
            ]
        },
        {
            id: "security-polish",
            title: "6. Security & Polish",
            sections: [
                {
                    id: "install-nginx",
                    title: "6.1 Install Nginx as a Reverse Proxy",
                    description: "Set up Nginx to serve your FastAPI app, handle static files, and manage SSL/TLS certificates.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Ubuntu Configuration',
                            commands: [
                                "sudo apt install nginx",
                                "sudo nano /etc/nginx/sites-available/fastapi_app",
                                "  server {\n    listen 80;\n    server_name your_domain.com www.your_domain.com;\n\n    location / {\n      proxy_pass http://127.0.0.1:8000;\n      proxy_set_header Host $host;\n      proxy_set_header X-Real-IP $remote_addr;\n      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n      proxy_set_header X-Forwarded-Proto $scheme;\n    }\n\n    location /static/ {\n      alias /path/to/your/app/static/;\n    }\n  }",
                                "sudo ln -s /etc/nginx/sites-available/fastapi_app /etc/nginx/sites-enabled/",
                                "sudo unlink /etc/nginx/sites-enabled/default",
                                "sudo nginx -t",
                                "sudo systemctl restart nginx"
                            ],
                            description: "Configure Nginx on Ubuntu using the `sites-available`/`sites-enabled` structure. Replace `your_domain.com` and `/path/to/your/app/static/`."
                        },
                        {
                            type: 'command',
                            platform: 'Amazon Linux 2023 Configuration',
                            commands: [
                                "sudo tee /etc/nginx/conf.d/fastapi.conf >/dev/null <<'EOF'\nserver {\n    listen 80 default_server;\n    server_name _;\n\n    location / {\n        proxy_pass         http://127.0.0.1:8000;\n        proxy_http_version 1.1;\n        proxy_set_header   Host $host;\n        proxy_set_header   X-Real-IP $remote_addr;\n    }\n}\nEOF",
                                "sudo nginx -t",
                                "sudo systemctl restart nginx"
                            ],
                            description: "Configure Nginx on Amazon Linux 2023. This uses the `/etc/nginx/conf.d/` directory for configuration files, which is a common practice on RHEL-based systems."
                        },
                        {
                            type: 'pitfall',
                            title: '502 Bad Gateway error from Nginx',
                            content: 'A "502 Bad Gateway" error indicates that Nginx is unable to connect to your backend FastAPI application.',
                            fix: 'Ensure your Uvicorn/Gunicorn process is running and accessible on `127.0.0.1:8000`. Test your Nginx configuration with `sudo nginx -t` (it should output "syntax is ok" and "test is successful"). Restart Nginx with `sudo systemctl restart nginx`. On some distributions, SELinux might be blocking Nginx access; check logs and configure if necessary.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Wrong Nginx configuration file path layout (Ubuntu vs Amazon Linux)',
                            content: 'Nginx configuration file locations and management differ between distributions (e.g., `sites-available`/`sites-enabled` on Debian/Ubuntu vs. `conf.d` on RHEL/Amazon Linux).',
                            fix: 'On Ubuntu, use `/etc/nginx/sites-available/` and symlink to `/etc/nginx/sites-enabled/`. On Amazon Linux 2023 (and other RHEL-based systems), place your configuration directly in `/etc/nginx/conf.d/` (e.g., `fastapi.conf`).'
                        },
                    ]
                },
                {
                    id: "enable-https",
                    title: "6.2 Enable HTTPS with Certbot (Let's Encrypt)",
                    description: "Secure your website with free SSL/TLS certificates provided by Let's Encrypt using Certbot.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Ubuntu Installation & Setup',
                            commands: [
                                "sudo snap install core",
                                "sudo snap refresh core",
                                "sudo snap install --classic certbot",
                                "sudo ln -s /snap/bin/certbot /usr/bin/certbot",
                                "sudo certbot --nginx -d your_domain.com -d www.your_domain.com"
                            ],
                            description: "Install Certbot via Snap and obtain/configure an SSL certificate for your domain using the Nginx plugin on Ubuntu."
                        },
                        {
                            type: 'command',
                            platform: 'Amazon Linux 2023 Installation & Setup',
                            commands: [
                                "sudo dnf install -y epel-release", // Enable EPEL repository if not already.
                                "sudo dnf install -y certbot python3-certbot-nginx",
                                "sudo certbot --nginx -d your_domain.com -d www.your_domain.com"
                            ],
                            description: "Install Certbot on Amazon Linux 2023 using `dnf` and the EPEL repository, then obtain/configure an SSL certificate for your domain."
                        },
                        {
                            type: 'pitfall',
                            title: 'Using `snap` on Amazon Linux 2023 (not installed by default)',
                            content: 'Snap is not typically installed or enabled on Amazon Linux 2023, so attempts to install Certbot via `snap` will fail.',
                            fix: 'On Amazon Linux 2023, install Certbot via the `dnf` package manager, often requiring the EPEL (Extra Packages for Enterprise Linux) repository: `sudo dnf install -y epel-release && sudo dnf install -y certbot python3-certbot-nginx`.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Certbot certificate renewal not configured',
                            content: 'Let\'s Encrypt certificates are only valid for 90 days. If renewal is not automated, your HTTPS will eventually expire.',
                            fix: 'Certbot typically installs a systemd timer (or cron job) for automatic renewals. Verify its status with `systemctl list-timers | grep certbot` (for systemd). If it\'s not running, ensure `certbot renew --dry-run` works without errors and then enable the timer.'
                        },
                        {
                            type: 'pitfall',
                            title: 'DNS records not pointing to EC2 IP',
                            content: 'Certbot needs to verify domain ownership. If your domain\'s A record does not point to your EC2 instance\'s public IP, certificate issuance will fail.',
                            fix: 'Before running Certbot, ensure your domain\'s A record (e.g., `your_domain.com`) and any `www` CNAME record point to the public IP address of your EC2 instance. Also, ensure your EC2 Security Group allows inbound traffic on port 443 (HTTPS).'
                        },
                    ]
                },
                {
                    id: "process-manager",
                    title: "6.3 Use a Process Manager (Gunicorn + Supervisord/Systemd)",
                    description: "Implement a process manager to ensure your application runs reliably, automatically restarts, and manages logs.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General (Gunicorn with Uvicorn Workers)',
                            commands: [
                                "pip install gunicorn",
                                "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:8000"
                            ],
                            description: "Install Gunicorn and run your FastAPI app with Uvicorn workers. Gunicorn handles process management, while Uvicorn workers allow FastAPI to leverage ASGI."
                        },
                        {
                            type: 'command',
                            platform: 'Ubuntu (Supervisord Configuration)',
                            commands: [
                                "sudo apt install supervisor",
                                "sudo nano /etc/supervisor/conf.d/fastapi_app.conf",
                                "  [program:fastapi_app]\n  command=/path/to/your/app/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:8000\n  directory=/path/to/your/app\n  user=ubuntu\n  autostart=true\n  autorestart=true\n  stdout_logfile=/var/log/supervisor/fastapi_app.log\n  stderr_logfile=/var/log/supervisor/fastapi_app_error.log",
                                "sudo supervisorctl reread",
                                "sudo supervisorctl update",
                                "sudo supervisorctl start fastapi_app"
                            ],
                            description: "Install and configure Supervisord to manage your Gunicorn process, ensuring it starts on boot and restarts if it crashes."
                        },
                        {
                            type: 'command',
                            platform: 'General (Systemd Configuration)',
                            commands: [
                                "sudo nano /etc/systemd/system/fastapi@.service",
                                "# /etc/systemd/system/fastapi@.service\n[Unit]\nDescription=FastAPI (Uvicorn) for %i\nAfter=network.target\n\n[Service]\nUser=%i\nWorkingDirectory=/home/%i/app\nEnvironment=PATH=/home/%i/app/.venv/bin\nExecStart=/home/%i/app/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target",
                                "sudo systemctl enable fastapi@ec2-user", // Replace ec2-user with your actual OS user
                                "sudo systemctl start fastapi@ec2-user"
                            ],
                            description: "Configure a Systemd service unit for your FastAPI application. Systemd is a powerful and widely used init system that manages services on Linux."
                        },
                        {
                            type: 'pitfall',
                            title: 'Misconfigured process manager leads to app not starting',
                            content: 'Errors in your Supervisord configuration file or Systemd service unit can prevent your application from starting or restarting correctly.',
                            fix: 'Always check the logs: `stdout_logfile` and `stderr_logfile` for Supervisord, or `journalctl -u fastapi@YOUR_USER -f` for Systemd. Use `sudo supervisorctl status` or `sudo systemctl status fastapi@YOUR_USER` to check service status.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Wrong virtual environment path in `ExecStart` (Systemd)',
                            content: 'If the `ExecStart` command in your Systemd service file does not specify the correct absolute path to your virtual environment\'s Python executable (e.g., `venv/bin/uvicorn`), the service will fail to start.',
                            fix: 'Use the absolute path to your Uvicorn or Gunicorn executable within your virtual environment, for example: `/home/ec2-user/app/.venv/bin/gunicorn` or `/home/ec2-user/app/.venv/bin/uvicorn`.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Environment variables not applied to service',
                            content: 'Sensitive data or configuration parameters stored as environment variables might not be correctly picked up by your Systemd or Supervisord service, leading to application errors.',
                            fix: 'For Systemd, add `Environment=KEY=VALUE` lines in the `[Service]` section of your service file and run `sudo systemctl daemon-reload` after changes. For Supervisord, use the `environment=` option in the `[program]` section.'
                        },
                    ]
                }
            ]
        },
        {
            id: "cors-browser-uis",
            title: "7. CORS for Browser UIs",
            description: "Implement Cross-Origin Resource Sharing (CORS) middleware in your FastAPI application to allow requests from browser-based frontends.",
            sections: [
                {
                    id: "implement-cors-middleware",
                    title: "7.1 Implement CORS Middleware",
                    description: "Add FastAPI's built-in CORS middleware to handle cross-origin requests.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Python (main.py)',
                            language: 'python',
                            commands: [
                                "from fastapi.middleware.cors import CORSMiddleware",
                                "",
                                "app.add_middleware(",
                                "    CORSMiddleware,",
                                "    allow_origins=[\"*\"],  # or specific URL(s) e.g. [\"http://localhost:3000\", \"https://your-frontend.com\"]",
                                "    allow_credentials=True,",
                                "    allow_methods=[\"*\"],",
                                "    allow_headers=[\"*\"],",
                                ")"
                            ],
                            description: "Add this code snippet to your main FastAPI application file (`main.py` or similar) to enable CORS. Remember to replace `\"*\"` with specific origins for production."
                        },
                        {
                            type: 'pitfall',
                            title: 'CORS blocked when UI runs on another origin',
                            content: 'If your browser-based UI is hosted on a different domain or port than your FastAPI backend, browser security policies will block requests to your API due to CORS restrictions.',
                            fix: 'Add the `CORSMiddleware` to your FastAPI application. In `allow_origins`, specify the exact URLs of your frontend applications (e.g., `["http://localhost:3000", "https://your-frontend.com"]`). Avoid `["*"]` in production as it allows requests from any origin, which can be a security risk.'
                        },
                    ]
                }
            ]
        },
        {
            id: "health-troubleshoot",
            title: "8. Health / Troubleshoot Commands",
            description: "Essential commands for checking the health and diagnosing issues with your FastAPI application on the EC2 instance.",
            sections: [
                {
                    id: "common-troubleshooting",
                    title: "8.1 Common Troubleshooting Steps",
                    description: "A collection of commands to quickly verify your application's status and logs.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'General',
                            commands: [
                                "# Check if app is accessible locally (expect 200)",
                                "curl -s -o /dev/null -w \"%{http_code}\\n\" http://127.0.0.1:8000/docs",
                                "",
                                "# Check if app is listening on the correct port and interfaces",
                                "ss -ltnp | grep 8000",
                                "",
                                "# Kill any stale Uvicorn processes",
                                "pkill -f \"uvicorn main:app\"",
                                "",
                                "# Follow Systemd service logs (replace 'ec2-user' with your actual OS user)",
                                "journalctl -u fastapi@ec2-user -f",
                                "",
                                "# Follow Supervisord logs (if used)",
                                "tail -f /var/log/supervisor/fastapi_app.log"
                            ],
                            description: "These commands help you quickly check if your application is running, listening, and what its logs indicate. Adjust paths and usernames as necessary."
                        }
                    ]
                }
            ]
        },
        {
            id: "final-security-polish",
            title: "9. Security Polish & Final Steps",
            description: "Refine your EC2 setup for better security, reliability, and usability.",
            sections: [
                {
                    id: "restrict-ssh-access",
                    title: "9.1 Restrict SSH to My IP",
                    description: "Enhance security by limiting SSH access to only your known IP address(es).",
                    contentBlocks: [
                        {
                            type: 'text',
                            content: 'After initial setup, it is crucial to restrict SSH access (port 22) in your EC2 Security Group to only your specific public IP address(es). Avoid leaving it open to `0.0.0.0/0` (Anywhere) in production environments.'
                        },
                        {
                            type: 'pitfall',
                            title: 'SSH port 22 open to the world (`0.0.0.0/0`)',
                            content: 'Leaving SSH open to all IP addresses (`0.0.0.0/0`) is a major security vulnerability, making your instance susceptible to brute-force attacks.',
                            fix: 'In your EC2 Security Group, modify the inbound rule for port 22 (SSH) to `Source: My IP` (or a specific IP range for your team/network). Update this rule whenever your public IP changes.'
                        }
                    ]
                },
                {
                    id: "assign-elastic-ip",
                    title: "9.2 Assign Elastic IP",
                    description: "Allocate and associate an Elastic IP address with your EC2 instance.",
                    contentBlocks: [
                        {
                            type: 'text',
                            content: 'By default, EC2 instances receive a new public IP address each time they are stopped and started. To ensure your application\'s URL remains constant, allocate an AWS Elastic IP and associate it with your EC2 instance.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Public IP changes after stop/start',
                            content: 'If you stop and start your EC2 instance, its public IP address will change, breaking any DNS records or direct links pointing to it.',
                            fix: 'Allocate an Elastic IP in the AWS Console (EC2 -> Elastic IPs) and associate it with your running EC2 instance. This provides a static public IP address that persists even if the instance is stopped and started.'
                        }
                    ]
                },
                {
                    id: "close-uvicorn-port",
                    title: "9.3 Close Port 8000 (after Nginx setup)",
                    description: "After Nginx is fully configured as a reverse proxy, restrict direct access to the Uvicorn port.",
                    contentBlocks: [
                        {
                            type: 'text',
                            content: 'Once Nginx is successfully routing traffic to your FastAPI application on port 8000, you should modify your EC2 Security Group to close port 8000 to external traffic. Nginx will handle all public-facing connections.'
                        },
                        {
                            type: 'pitfall',
                            title: 'Port 8000 still open to the public after Nginx setup',
                            content: 'Leaving port 8000 open to `0.0.0.0/0` even after Nginx is set up exposes your backend directly and circumvents Nginx\'s security features (like SSL termination).',
                            fix: 'In your EC2 Security Group, change the inbound rule for port 8000 from `Source: 0.0.0.0/0` to `Source: 127.0.0.1` (or `::1` for IPv6, if applicable). This ensures only Nginx (running on the same instance) can access your Uvicorn process directly.'
                        }
                    ]
                }
            ]
        },
        {
            id: "test-checklist",
            title: "10. Test Deployment Checklist",
            description: "Quick commands to validate the success of your FastAPI deployment.",
            sections: [
                {
                    id: "validate-deployment",
                    title: "10.1 Validate Your Deployment",
                    description: "Run these checks from your local machine (or within EC2) to ensure everything is working as expected.",
                    contentBlocks: [
                        {
                            type: 'command',
                            platform: 'Local Machine (after DNS update)',
                            commands: [
                                "# Check application via domain (expect 200, or redirect to HTTPS)",
                                "curl -s -o /dev/null -w \"%{http_code}\\n\" http://your_domain.com/docs",
                                "curl -s -o /dev/null -w \"%{http_code}\\n\" https://your_domain.com/docs"
                            ],
                            description: "Verify that your application is reachable via your domain name and responds with a 200 OK status, ideally with HTTPS."
                        },
                        {
                            type: 'command',
                            platform: 'Within EC2 Instance',
                            commands: [
                                "# Check if the application is running and accessible locally (expect 200)",
                                "curl -s -o /dev/null -w \"%{http_code}\\n\" http://127.0.0.1:8000/docs",
                                "",
                                "# Check Nginx configuration for errors",
                                "sudo nginx -t",
                                "",
                                "# Check Nginx service status",
                                "sudo systemctl status nginx",
                                "",
                                "# Check your FastAPI service status (replace 'ec2-user' with your OS user)",
                                "sudo systemctl status fastapi@ec2-user",
                                "",
                                "# View real-time logs for your FastAPI service",
                                "journalctl -u fastapi@ec2-user -f"
                            ],
                            description: "These commands help verify the status of your FastAPI application, Nginx, and process manager directly on the EC2 instance."
                        }
                    ]
                }
            ]
        }
    ];

    // State for managing dark/light theme
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
    // State for search query
    const [searchQuery, setSearchQuery] = useState('');
    // State to track the currently active section for TOC highlighting
    const [activeSectionId, setActiveSectionId] = useState('');

    // Ref for the main content area to observe scroll
    const mainContentRef = useRef(null);
    // Refs for each section to observe their visibility
    const sectionRefs = useRef({});

    // Effect to apply theme to the document body and save to localStorage
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Function to toggle theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Effect to set up IntersectionObserver for TOC active highlighting
    useEffect(() => {
        const observerOptions = {
            root: mainContentRef.current, // Observe within the main content scroll area
            rootMargin: '0px 0px -50% 0px', // When 50% of the section is visible
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSectionId(entry.target.id);
                }
            });
        }, observerOptions);

        // Observe all main sections
        Object.values(sectionRefs.current).forEach((ref) => {
            if (ref) {
                observer.observe(ref);
            }
        });

        // Disconnect observer on cleanup
        return () => {
            observer.disconnect();
        };
    }, [searchQuery, checklistContent]); // Re-run observer if search filters content or content changes, ensuring correct refs are observed

    // Filter content based on search query
    const filteredContent = checklistContent.filter((mainSection) => {
        const matchesMainTitle = mainSection.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubSections = mainSection.sections.some((subSection) =>
            subSection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subSection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subSection.contentBlocks.some(block => {
                if (block.type === 'command' && block.commands.some(cmd => cmd.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
                if (block.type === 'pitfall' && (block.title.toLowerCase().includes(searchQuery.toLowerCase()) || block.content.toLowerCase().includes(searchQuery.toLowerCase()) || block.fix.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
                if (block.type === 'text' && block.content.toLowerCase().includes(searchQuery.toLowerCase())) return true;
                return false;
            })
        );
        return matchesMainTitle || matchesSubSections;
    }).map(mainSection => ({
        ...mainSection,
        sections: mainSection.sections.filter(subSection =>
            subSection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subSection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subSection.contentBlocks.some(block => {
                if (block.type === 'command' && block.commands.some(cmd => cmd.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
                if (block.type === 'pitfall' && (block.title.toLowerCase().includes(searchQuery.toLowerCase()) || block.content.toLowerCase().includes(searchQuery.toLowerCase()) || block.fix.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
                if (block.type === 'text' && block.content.toLowerCase().includes(searchQuery.toLowerCase())) return true;
                return false;
            })
        )
    }));


    // Component for a styled button (e.g., for "Back to Top")
    const Button = ({ children, onClick, className = '' }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800 ${className}`}
        >
            {children}
        </button>
    );

    // Component for the Header (sticky, contains breadcrumbs and theme toggle)
    const Header = ({ breadcrumbs, onBackToTop, theme, toggleTheme }) => {
        return (
            <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm z-50 p-4 flex items-center justify-between flex-wrap gap-2">
                <nav aria-label="Breadcrumb" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <ol className="flex space-x-2 items-center">
                        <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a></li>
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index} className="flex items-center">
                                <span className="mx-2">/</span>
                                <a href={`#${crumb.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                                    {crumb.label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="flex items-center space-x-4">
                    <Button onClick={onBackToTop} className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        Back to Top
                    </Button>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </header>
        );
    };

    // Component for Theme Toggle
    const ThemeToggle = ({ theme, toggleTheme }) => (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
            {theme === 'light' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.325 5.325l-.707.707M6.707 6.707l-.707-.707m12.728 0l-.707-.707M6.707 17.293l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            )}
        </button>
    );

    // Component for Search Bar
    const SearchBar = ({ searchQuery, setSearchQuery }) => (
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
            <label htmlFor="search-input" className="sr-only">Search checklist</label>
            <input
                id="search-input"
                type="text"
                placeholder="Search checklist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                aria-label="Search checklist"
            />
        </div>
    );

    // Component for Code Block with Copy Button
    // The `language` prop is passed but not directly used for highlighting in this
    // pure HTML/CSS/JS context without a separate syntax highlighter library.
    // It's kept for future integration with libraries like react-syntax-highlighter.
    const CodeBlockWithCopy = ({ commands, language = 'bash' }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = (text) => {
            // Using document.execCommand('copy') for better iFrame compatibility
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed'; // Avoid scrolling to bottom
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
            } catch (err) {
                console.error('Failed to copy text: ', err);
            } finally {
                document.body.removeChild(textarea);
            }
        };

        return (
            <div className="bg-gray-800 dark:bg-gray-950 rounded-lg p-4 my-4 relative font-mono text-sm text-gray-50 overflow-x-auto">
                <button
                    onClick={() => handleCopy(commands.join('\n'))}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Copy code to clipboard"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="whitespace-pre-wrap">
                    <code>
                        {commands.map((cmd, index) => (
                            <div key={index} className="py-0.5">{cmd}</div>
                        ))}
                    </code>
                </pre>
            </div>
        );
    };

    // Component for an expandable Alert/Tip with Pitfall and Solution
    const AlertTip = ({ title, pitfall, solution }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-600 p-4 my-4 rounded-lg shadow-sm" role="alert">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={`alert-content-${title.replace(/\s+/g, '-')}`}>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        {title}
                    </h3>
                    <span className="text-yellow-800 dark:text-yellow-200">
                        {isOpen ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        )}
                    </span>
                </div>
                <div id={`alert-content-${title.replace(/\s+/g, '-')}`} className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                        <span className="font-semibold">Pitfall:</span> {pitfall}
                    </p>
                    {solution && (
                        <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                            <span className="font-semibold">Solution:</span> {solution}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // Component for Collapsible Accordion sections
    const Accordion = ({ title, description, contentBlocks, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);

        return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 shadow-md">
                <h2 className="mb-0">
                    <button
                        className="flex justify-between items-center w-full p-5 text-left font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        aria-controls={`accordion-content-${title.replace(/\s+/g, '-')}`}
                    >
                        {title}
                        <span className="transform transition-transform duration-300 ease-in-out">
                            {isOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            )}
                        </span>
                    </button>
                </h2>
                <div
                    id={`accordion-content-${title.replace(/\s+/g, '-')}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                        {description && <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>}
                        {contentBlocks && contentBlocks.map((block, index) => {
                            if (block.type === 'command') {
                                return (
                                    <div key={index} className="mb-4">
                                        {block.platform && (
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                {block.platform}
                                            </span>
                                        )}
                                        {block.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 mb-2">{block.description}</p>}
                                        <CodeBlockWithCopy commands={block.commands} language={block.language || 'bash'} />
                                    </div>
                                );
                            } else if (block.type === 'pitfall') {
                                return (
                                    <AlertTip
                                        key={index}
                                        title={block.title}
                                        pitfall={block.content}
                                        solution={block.fix}
                                    />
                                );
                            } else if (block.type === 'text') {
                                return (
                                    <p key={index} className="text-gray-700 dark:text-gray-300 mb-4">{block.content}</p>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Component to display a main Checklist Section
    const ChecklistSection = ({ mainSection, defaultOpen = false, sectionRefs }) => (
        <section id={mainSection.id} ref={(el) => (sectionRefs.current[mainSection.id] = el)} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                {mainSection.title}
            </h2>
            <div>
                {mainSection.sections.map((step) => (
                    <Accordion
                        key={step.id}
                        title={step.title}
                        description={step.description}
                        contentBlocks={step.contentBlocks} // Pass contentBlocks instead of commands/pitfalls directly
                        defaultOpen={defaultOpen}
                    />
                ))}
            </div>
        </section>
    );

    // Component for the Table of Contents
    const TableOfContents = ({ content, activeSectionId, sectionRefs }) => {
        const scrollToSection = useCallback((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, []);

        return (
            <nav className="sticky top-[80px] p-4 bg-gray-50 dark:bg-gray-850 rounded-xl shadow-md hidden lg:block h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar transition-colors duration-200" aria-label="Table of Contents">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Contents</h3>
                <ul>
                    {content.map((mainSection) => (
                        <li key={mainSection.id} className="mb-2">
                            <a
                                href={`#${mainSection.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(mainSection.id);
                                }}
                                className={`block py-2 px-3 rounded-lg transition-colors duration-200 ${
                                    activeSectionId === mainSection.id
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                aria-current={activeSectionId === mainSection.id ? "true" : undefined}
                            >
                                {mainSection.title}
                            </a>
                            {mainSection.sections.length > 0 && (
                                <ul className="ml-4 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                    {mainSection.sections.map((subSection) => (
                                        <li key={subSection.id} className="mb-1">
                                            <a
                                                href={`#${subSection.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    scrollToSection(subSection.id);
                                                }}
                                                className={`block py-1 px-2 text-sm rounded-md transition-colors duration-200 ${
                                                    activeSectionId === subSection.id
                                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-800 dark:text-blue-300 font-medium'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                                aria-current={activeSectionId === subSection.id ? "true" : undefined}
                                            >
                                                {subSection.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

    // SEO: Generate JSON-LD for FAQPage schema
    const generateFAQSchema = () => {
        const faqs = [];
        checklistContent.forEach(mainSection => {
            mainSection.sections.forEach(step => {
                // Extract description or combined content for the answer
                let answerText = step.description || '';
                if (step.contentBlocks) {
                    step.contentBlocks.forEach(block => {
                        if (block.type === 'text') {
                            answerText += ' ' + block.content;
                        } else if (block.type === 'pitfall') {
                            answerText += ` Pitfall: ${block.content}. Solution: ${block.fix}.`;
                        }
                    });
                }

                faqs.push({
                    "@type": "Question",
                    "name": step.title,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answerText.trim()
                    }
                });
            });
        });

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs
        };
    };

    // Inject SEO metadata and JSON-LD into the document head
    useEffect(() => {
        // Set document title
        document.title = "FastAPI + Uvicorn on AWS EC2 Deployment Checklist";

        // Add meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', 'A comprehensive checklist for deploying FastAPI and Uvicorn applications on AWS EC2 instances, covering setup, security, and best practices. Includes platform-specific commands and common pitfalls.');

        // Add FAQPage JSON-LD
        let scriptTag = document.getElementById('faq-schema');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.setAttribute('type', 'application/ld+json');
            scriptTag.setAttribute('id', 'faq-schema');
            document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(generateFAQSchema());

        // Cleanup function for when the component unmounts (optional, but good practice)
        return () => {
            if (scriptTag && scriptTag.parentNode) {
                scriptTag.parentNode.removeChild(scriptTag);
            }
            // Optionally remove meta description if not desired globally
            // if (metaDescription && metaDescription.parentNode) {
            //     metaDescription.parentNode.removeChild(metaDescription);
            // }
        };
    }, [checklistContent]); // Re-run if checklist content changes to update schema

    // Handler for Back to Top button
    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Render the main application layout
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter transition-colors duration-200">

            <Header
                breadcrumbs={[{ id: 'home', label: 'Deployment Checklist' }]}
                onBackToTop={handleBackToTop}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <main className="container mx-auto p-4 lg:p-8 pt-24 grid lg:grid-cols-4 gap-8">
                {/* Table of Contents - Hidden on small screens */}
                <aside className="lg:col-span-1">
                    <TableOfContents content={filteredContent} activeSectionId={activeSectionId} sectionRefs={sectionRefs} />
                </aside>

                {/* Main Content Area */}
                <div ref={mainContentRef} className="lg:col-span-3">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-8 leading-tight">
                        FastAPI + Uvicorn on AWS EC2 Deployment Checklist
                    </h1>

                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                    {/* Render filtered checklist sections */}
                    {filteredContent.length > 0 ? (
                        filteredContent.map((mainSection) => (
                            <ChecklistSection
                                key={mainSection.id}
                                mainSection={mainSection}
                                sectionRefs={sectionRefs}
                            />
                        ))
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center text-lg mt-10">
                            No results found for "{searchQuery}". Try a different search term.
                        </p>
                    )}
                </div>
            </main>

            {/* Back to Top button for smaller screens (sticky at bottom right) */}
            <div className="fixed bottom-4 right-4 lg:hidden">
                <Button onClick={handleBackToTop} className="shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                </Button>
            </div>
        </div>
    );
}

export default App;
