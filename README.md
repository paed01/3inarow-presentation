3inone-presentation
========

Webstep presentation of node.js and socket.io in London October 2014.

## Table of Contents

- Presentation
    - [Step 1 - The http server](/docs/Step1.md)
    - [Step 2 - The game](/docs/Step2.md)
    - [Step 3 - Serverside game](/docs/Step3.md)
    - [Step 4 - Test and deploy](/docs/Step4.md)
- [Install](#install)
- [The game](/docs/Step2.md)

## Install
1. Install [git](http://git-scm.com/downloads)
2. Install [node and npm](http://nodejs.org) 
3. Open terminal/cmd
4. Run: `git clone git@github.com:paed01/3inarow-presentation.git`
5. Run: `cd 3inarow-presentation`
6. Run: `npm install`
7. Start server with: `node index.js`

# Notes

## Lessons learned
In Chrome the socket.io-client disconnects if an error occur in the client-side javascript. This causes the server to reissue a new connection, hence the board is reset.