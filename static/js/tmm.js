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

$(function() {


    // deleteFilm listener
    $('body').on("click", ".delete-layer", function() {
        var id = $(this).attr('id');
        var suffix = id.match(/\d+/)[0];
        console.log('delete '+suffix);
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
        console.log("save_stack project "+project_id); //SC
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


