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
    for (item in config.stack) {
        var layer = config.stack[item];
        $('#stack').append("<li>"+layer.layer+", "+layer.d+" - <a class='delete-layer film-operation' id='delete-layer-"+item+"'>delete</a></li>")// | <a class='up-layer'>up</a> | <a class='down-layer'>down</a></li>");
    };
};

function parseBook(book) {
    var li="";
    $.each(book, function(i, v) {
        li+="<div class='subfolder'><p class='level3'><a>"+v.PAGE+"</a></p></div>";
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
function librarySearch (library, key) {
    result = [];
    main = library[0].content;
    $.each(library, function(i,w) {
        $.each(w.content, function(i,v) {
            try {
                if (v.name.search(key) != -1) {
                    result.push(v);
                }
            } catch (e) {
                console.log(e instanceof TypeError);
            }
        });
    });
    return result;
};

$(function() {
    //Library Toggles
    $(".subfolder p").click(function() {
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
        config.stack.splice(id, 1);
        listStack(config);

        
    }

    // Save on submit
    $('#save-form').on('submit', function(event){ 
        event.preventDefault();
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
                console.log(json);
                console.log('success');
            },
            error: function(xhr,errmsg,err) {
                console.log(xhr,status + ": " + xhr.responseText);
            }
        });
    };


       
})

