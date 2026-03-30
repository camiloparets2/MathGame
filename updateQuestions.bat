@echo off
cd /d "c:\Users\Camilo\Mission007\MATH_GAME"
npm run update-questions
npm run deploy
echo Update and deploy completed at %date% %time% >> update_log.txt