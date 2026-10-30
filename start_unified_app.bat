@echo off
title EnterpriseFlow AI Unified Launcher
cd /d "%~dp0\unified_onboarding"
echo ====================================================================
echo  Launching EnterpriseFlow AI Unified Multi-Agent Onboarding Platform
echo ====================================================================
call .venv\Scripts\activate.bat
python run_app.py
pause
