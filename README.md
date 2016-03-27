## Battle Stations!

Battle-stations is a simple status page based on Github issues that you can host everywhere.
Highlights:

* Uses the Github Issues API to display incidents to the user.
* Updates automatically when you create/update/close issues in your Github project.
* Does not require a backend server as it communicates directly with the Github API.
* Performs a client-side reachability check of your own APIs.

## Setup

* Fork this repository
* Edit the title and meta information in `index.html` to match your website/company.
* Point `githubProject` in `index.js` to your own Github project and
  (optionally) add/edit your API endpoints that you want to have checked.

If you want to host your status page via Github pages, follow their instructions here:

https://pages.github.com/

## Usage

* To create new incidents, simply create a new issue in your project and add
  a label with name `incident` to it (you might need to create this label first).
* To mark incidents as resolved, simply close the corresponding issue.

## Questions & Answers

### What technologies does this use?

It uses jQuery, React.js and a few CSS/HTML libraries (Bootstrap, Font-Awesome).
The code is kept as simple as possible and runs without any build steps / compilation.

### How does this work?

We simply use the public Github API to retrieve issues from your Github project.
We then use React.js to display these issues to the user.

### Will this work without a valid API key?

Github allows us to use the public API without providing a valid access token.
The rate limit imposed (currently 60 requests every 10 minutes) is high enough
for our use case, especially since Github does not count repeated requests
against that same endpoint if the data has been unchanged and a valid cache/ETag
header was provided.

### What happens when Github goes down as well?

In that case the status page will not work, sorry.

### License

This project is licensed under the MIT license.
