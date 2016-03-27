//Configure the API endpoints that you want to check here...
//Please make sure that those endpoints allow crossdomain calls, or be sure
//to host this site in the same domain as your API (and set `document.domain` correspondingly)
var apis = {
    github : {
        title: 'Github Public API (not our own but we couldnt live without it)',
        url: 'https://api.github.com/users' //replace this with your own API endpoints
    }
};

//Replace this with your status page project name
var githubProject = 'adewes/battle-stations';

//Github URLs
var issuesApiUrl = 'https://api.github.com/repos/'+githubProject+'/issues?limit=100&sort=created&direction=desc&state=all'
var issuesHtmlUrl = 'https://github.com/'+githubProject+'/issues?q=';
var newIssueUrl = 'https://github.com/'+githubProject+'/issues/new';

//just a convenient shortcut
var e = React.createElement

var markDownParser = function(str){
    var lines = str.split("\n");
    var output = [];
    for(var i=0;i<lines.length;i++){
        var line=lines[i];
        var titleRegex = /^(\#+)\s+(.*)/ig;
        var result = titleRegex.exec(line)
        if (result){
            var order = result[1].length;
            output.push(e('h'+(order+2).toString(),{key : i},result[2]))
            continue;
        }
        output.push(e('p',{key : i},line))
    }
    return output;
}

var IssuesList = React.createClass({

    render : function(){
        var issueItems = e('p',{className : 'alert alert-info',key : 'info'},'Please wait, loading status information from Github...')
        if (this.props.error)
            issueItems = e('p',{className : 'alert alert-danger',key : 'error'},this.props.error)
        else if (this.props.issues !== undefined){
            issueItems = this.props.issues.map(function(issue){
                var found = false;
                issue.labels.map(function(label){
                    if (label.name == 'incident')
                        found = true;
                })
                if (!found)
                    return;
                var creationDate = new Date(issue.created_at);
                var updateDate = new Date(issue.updated_at);
                var closeDate = new Date(issue.closed_at);
                var updateOrCloseDate = 'updated: '+updateDate.toLocaleString()
                var className = 'panel-danger';
                if (issue.state == 'closed'){
                    className = 'panel-success'
                    updateOrCloseDate = 'resolved: '+updateDate.toLocaleString();
                }
                return e('div',{key : 'issueItems',className: 'panel '+className,key : issue.id},[
                    e('div',{key: 'heading',className : 'panel-heading'},
                        e('h3',{className : 'panel-title', key : 'title'},
                            [(issue.state == 'closed' ? 'RESOLVED: ' : '') + issue.title]
                        )),
                    e('div',{key: 'body',className : 'panel-body'},
                        [
                        e('p',null,[e('span',{key : 'creationDate',className: ''},
                                        'reported: '+ creationDate.toLocaleString()),
                                    e('span',{key : 'updateDate',className: 'pull-right'},
                                        updateOrCloseDate)]),
                        e('hr',{className: 'hr'}),
                        markDownParser(issue.body),
                        e('p',null,e('a',{key : 'github-link',href : issue.html_url},
                            'discuss on Github ('+issue.comments + ' comments so far)'))
                        ]
                        )
                    ])
            }.bind(this)).filter(function(e){return e !== undefined})
            if (issueItems.length == 0)
                issueItems = e('p',{className : 'alert alert-success',key : 'no-incidents-found'},
                                'No incidents found!')
        }
        return e('div',{key : 'issues',className : 'status-updates'},[
            e('h2',{key : 'title'},['Latest Incidents ',
                                    e('a',{className : 'pull-right',href : '#',
                                            onClick : this.props.refreshIssues},
                                            e('i',{className : 'fa fa-refresh'+
                                                (this.props.refreshing ? ' fa-spin' : '')}))
                                    ]),
            e('p',{key : 'link'},[
                e('a',{'href' : issuesHtmlUrl},'see all on Github'),
                ' // ',
                e('a',{'href' : newIssueUrl},'report an incident')
                ]),
            issueItems,
            ])

    }
})

var StatusList = React.createClass({

    componentDidMount : function(){
        this.refreshIssues()
        this.checkerId = setInterval(this.refreshIssues,10000);
    },

    componentWillUnmount : function(){
        clearInterval(this.refreshIssues);
    },

    componentWillMount : function(){

        var markAsSuccessful = function(key){
            d = {}
            d[key] = 'success'
            this.setState(d)
        }.bind(this)

        var markAsFailed = function(key){
            d = {}
            d[key] = 'error'
            this.setState(d)
        }.bind(this)
        for(var key in apis){
            var site = apis[key]
            //we use an AJAX request to check this website
            $.get({
                url : site.url,
                crossDomain : true,//make sure to allow cross-origin requests for the relevant endpoint
                timeout : site.timeout || 3000,
                success : markAsSuccessful.bind(this,key),
                error: markAsFailed.bind(this,key)
            })
        }
    },

    refreshIssues : function(e){

        if (e !== undefined)
            e.preventDefault();

        if (!this.isMounted())
            return;

        this.setState({refreshing : true})

        var updateIssues = function(data){
            this.setState({issues : data})
            //we add a timeout to give some UI feedback on the loading even if it is instantaneous
            setTimeout(function(){this.setState({refreshing : false})}.bind(this),200)
        }.bind(this)

        $.get({
            url : issuesApiUrl,
            success : updateIssues,
            error : function(){
                //we add a timeout to give some UI feedback on the loading even if it is instantaneous
                setTimeout(function(){this.setState({refreshing : false})}.bind(this),200)
                this.setState({error : 'Cannot load incidents from Github, sorry.'})}.bind(this)
        })
    },

    getInitialState : function(){
        return {
            refreshing : false
        }
    },

    render : function(){
        var apiStatuses;
        var items = Object.keys(apis).map(function(key){
            var site = apis[key]
            var statusBadge;
            var makeBadge = function(color,icon,text){
                return e('span',{className: 'badge '+color,key:'badge'},
                    [e('i',{className : 'fa '+icon}),' ',e('span',null,text)])
            }
            if (this.state[key] === undefined)
                statusBadge = makeBadge('grey','fa-spin fa-refresh',' waiting for response')
            else if (this.state[key] && this.state[key] == 'success')
                statusBadge = makeBadge('green','fa-check','everything seems okay')
            else
                statusBadge = makeBadge('red','fa-times','an error occurred')
            return e('li',{className : 'list-group-item',key : key},
                [,
                 e('span',{key : 'title'},site.title),
                 ' ',
                 e('span',{key : 'url-info','className' : 'fa fa-dot-circle-o','title' : site.url},null),
                 statusBadge
                ]
                )
        }.bind(this));
        if (items.length)
            apiStatuses = [
            e('hr',{key : 'hr'}),
            e('h2',{},'Reachability of APIs'),
            e('p',{},'Please note: This only reflects the reachability of our APIs from your computer.'),
            e('ul',{key : 'statuses',className : 'list-group'},items),
            e('a',{'href' : newIssueUrl},'report an incident')
            ];
        return e('div',null,
            [
            e(IssuesList,{key : 'issues',issues : this.state.issues,
                          refreshing : this.state.refreshing,
                          error : this.state.error,
                          refreshIssues : this.refreshIssues}),
            apiStatuses
            ])
    }

})

ReactDOM.render(e(StatusList),document.getElementById('app'));
