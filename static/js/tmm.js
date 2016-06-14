// initiate html

// converts unicode json string from django to json object
function parseJSON (jsonstr) {
    var obj = ((jsonstr).replace(/&(l|g|quo)t;/g, function(a,b){
            return {
                l   : '<',
                g   : '>',
                quo : '"'
            }[b];
        }));
    var obj2 = JSON.parse(obj);
    return obj2;
};

function listStack (config) {
    $('#stack').empty();
    $('#stack').append("<li>"+config.input.layer+" (substrate) - <a class='change-input film-operation' id='change-input'>change</a></li>");
    for (item in config.stack) {
        var layer = config.stack[item];
        $('#stack').prepend("<li>"+layer.layer+", "+layer.d+" - <a class='delete-layer film-operation' id='delete-layer-"+item+"'>delete</a></li>")// | <a class='up-layer'>up</a> | <a class='down-layer'>down</a></li>");
    };
};

function parseBook(book) {
    var li="";
    $.each(book, function(i, v) {
        if (v.path) {
            pathstr = v.path.replace(/\s/g,"!!");
            li+="<div class='subfolder'><p id='"+pathstr+"' class='level3'><a>"+v.name+"</a> - <a id="+pathstr+" class='libadd'>add</a></p></div>";
        }
        /*
        else {
            //console.log('error')

        }
        */
    });
return li;
}


function parseShelf(shelf) {
var li = "";
$.each(shelf.content, function(i, v) {
    if (v.content) {
        subul = parseBook(v.content);
        li+="<div class='subfolder'><p class='level2'><a>"+v.name+"</a></p>"+subul+"</div>";
    }
});
return li;
}
function parseLibrary(library) {
var li = "";
$.each(library, function(i, v) {
    subul = parseShelf(v)
    li += "<div class='subfolder'><p class='level1' id='"+v.SHELF+"'><a>"+v.name+"</a></p>"+subul+"</div>";
});
return li;
}


// Library search by "name"
function parseSearch(result) {
li = "";
$.each(result, function(i, v) {
    console.log('done');
    subul = parseBook(v.content);
    li+="<div class='subfolder'><p class='level2'><a>"+v.name+"</a></p>"+subul+"</div>";
    $('#library-list').html(li);
});

}

function librarySearch (library, key) {
result = [];
//main = library[0].content;
$.each(library, function(i,w) {
    $.each(w.content, function(i,v) {
        try {
            if (v.name.toLowerCase().search(key.toLowerCase()) != -1) {
                result.push(v);
            }
        } catch (e) {
            console.log(e instanceof TypeError);
        }
    });
});
parseSearch(result);
};

$(function() {
//add layer listenter
$('body').on("click", ".libadd", function() {
    var path = $(this).attr('id');
    addLayer(path);
});

function addLayer (path) {
    splitstr = path.split("/").reverse();
        console.log('film is being added');
        config.stack.push({"layer": splitstr[1], "d": 100, "path": path});
        listStack(config);
        updateN(path);
    }
});

function updateN(path) {
    if (typeof N[path] == "undefined") {
        //ajax to get new N
        updateNAjax(config)
    } else {
        console.log('yup');
    }
}

function updateNAjax(config) {
    $.ajax({
        url   :"add_layer/", //endpoint
        type  :"POST", // http method
        data  : {data:JSON.stringify(config)}, // data send with post request
        success :function(json) {
            N = parseJSON(json.N)
        },
        error: function(xhr,errmsg,err) {
            console.log(xhr,status + ": " + xhr.responseText);
        }
    });
}


$(function() {
    // Library page listener
    $('body').on("click", ".level3", function() {
        var path = $(this).attr('id');
        newpath = path.replace("!!", " ");
        libPage(newpath);
    });

    function setLibpage(result) {
        page = parseJSON(result.page)
        //data = parseJSON(result.data)
        libpage = result;
        chart = "<div id='lib-page-chart'></div>"
        references = "<div class='subfolder'><p class='level2'><a>References</a></p><div class='sbfolder'><p class='level3'>"+page.REFERENCES+"</p></div></div>";
        comments = "<div class='subfolder'><p class='level2'><a>Comments</a></p><div class='sbfolder'><p class='level3'>"+page.COMMENTS+"</p></div></div>";
        data = "<div class='subfolder'><p class='level2'><a>Data</a></p><div class='sbfolder'><p class='level3'>Data type: "+page.DATA[0].type+"</p></div></div>";
        $('#lib-page').html(chart+references+comments+data);
        plot(libpage, 'lib-page-chart');
        plot(libpage, 'out-page-chart');
    }

    // AJAX for get page
    function libPage (path) {
        $.ajax({
            url   :"lib_page/", //endpoint
            type  :"POST", // http method
            data  : {data:path}, // data send with post request
            success :function(json) {
                console.log('success');
                setLibpage(json);
            },
            error: function(xhr,errmsg,err) {
                console.log(xhr,status + ": " + xhr.responseText);
            }
        });
    }
    
    $("input[type='text']").on("click", function () {
           $(this).select();
    });

    //Library Toggles
    $('body').on("click", ".subfolder p", function() {
        $(this).siblings('.subfolder').toggle();
    });

    // deleteFilm listener
    $('body').on("click", ".delete-layer", function() {
        var id = $(this).attr('id');
        var suffix = id.match(/\d+/)[0];
        deleteFilm(suffix);
    });


    // deleteFilm function
    function deleteFilm(id) {
        path = config.stack[id].path;
        config.stack.splice(id, 1);
        //if there are no other films
        var flag = false;
        $.each(config.stack, function(i,w) {
            if (config.stack[i].path == path) {
                listStack(config);
                console.log('check');
                flag = true;
            }
        });
        if (flag == false) {
            updateN(config);
            console.log('N repo updated');
        }
        listStack(config);
    }

    // Save on submit
    $('#save-form').on('submit', function(event){ 
        event.preventDefault();
        console.log('save')
        var project_id = $(this).attr('name')
        save_stack(config, project_id)
    });

    // AJAX for save
    function save_stack(config, project_id) {
        $.ajax({
            url   :"save_project/", //endpoint
            type  :"POST", // http method
            data  : {data:JSON.stringify(config), id:project_id}, // data send with post request
            success :function(json) {
                console.log('success');
            },
            error: function(xhr,errmsg,err) {
                console.log(xhr,status + ": " + xhr.responseText);
            }
        });
    };

    $('#search-form').on('submit', function(event){ 
        event.preventDefault();
        $(':focus').blur();
        text = $('#search-text').val()
        if (text == "") {
            console.log('empty');
        } else {
            console.log('Searching ...')
            librarySearch(library, text);
        };
        
    });


       
})


