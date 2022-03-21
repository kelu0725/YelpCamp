# YelpCamp

To run locally:
1. Install npm, node, nodemon. (For Mac: use home brew to install)
2. Install mongo and start mongo service in backend.
3. Create .env file, to include credentials for cloudinary and mapbox
4. Go to where app.js is located, run:
    nodemon app.js



To run in cloud:
1. Use mongodb atlas to run mongo in cloud


To deploy in Heroku
1. Create account in heroku
2. Go to the dir, run below command
    - Install Heroku CLI: homebrew command
    - heroku login
    - heroku create
    - Update environment variable, then git add.  ; git commit; git push && git push heroku
    - heroku logs --tail: to check logs
    - Fix heroku error: add start to package.json; change port to env port