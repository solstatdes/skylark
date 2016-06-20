//Global Methods
function multiply(A, B) {
    C = [];
    $.each(A, function(i) {
        C.push(math.multiply(A[i],B[i]));
    });
    return C
}

function divide(A, B) {
    C = [];
    $.each(A, function(i) {
        C.push(math.divide(A[i],B[i]));
    });
    return C
}
// Stack Class
function Stack(config, N){

    this.matrixElement = function(i) {
        Adm = this.Adm;
        label = this.config.stack[i].path;
        
        //Get layer thickness (in micron)
        d = this.config.stack[i].d/1000;

        //Get wavelength values (in micron) 
        x = this.N.x

        n = this.N[label].n;
        k = this.N[label].k;

        element = [];
            
        $.each(n, function(j, v) {
            //Get complex N
            N = math.complex(v, k[j]); //Create a complex refractive index
            NAdm = math.multiply(N, Adm); //Calculate admittance
            phase = math.multiply(math.divide(N, x[j]), (d*math.pi*2)); //Calculate phase
            //Calculate matrix elements
            A = math.cos(phase);
            B = math.divide(math.multiply(math.complex(0,1), math.sin(phase)), NAdm);
            C = math.multiply(math.multiply(math.complex(0,1),math.sin(phase)), NAdm);
            D = math.cos(phase);
            //Append 2x2 matrix to list
            element.push(math.matrix([[A, B],[ C, D]]));
        });

        return element

    };

    this.matrixBuild = function(){
        M = [];
        $.each(this.config.stack, function(i, obj) {
            M.push(this.matrixElement(i));
        }.bind(this));
        return M;
    };

    this.matrixMult = function() {
        array = this.M.slice();
        I = math.matrix([[1,0],[0,1]]); //Identity matrix
        M = Array.apply(null, Array(this.N.x.length)).map(Array.prototype.valueOf, I); //Initiate array of length N with I
        if (this.config.configuration == 'substrate') {
            array.reverse();
        };

        //DOUBLE RAINBOW ALL THE WAY!
        //Loop through stack 
        $.each(array, function(i, matrix) {
            // Loop through wavelengths
            $.each(matrix, function(j) {
                M[j] = math.multiply(M[j], matrix[j]);
            });
        });

        return M;
    };

    this.calcStack = function() {
        //Define substrate matrix
        M = this.matrixMult();

        substrate = this.config.output.path;
        console.log(substrate);

        nSub = this.N[substrate].n;
        kSub = this.N[substrate].k;

        NSubArr = [];
        YSubArr = [];
        Y = [];
        BCArr = [];

        $.each(n, function(i, v) {
            NSub = math.complex(nSub[i],kSub[i]);

            YSub = math.multiply(NSub, this.Adm);
            Y = math.matrix([1, YSub]);


            if (this.config.configuration == 'substrate') {
                BC = math.multiply(M[i], Y);
            } else {
                BC = math.multiply(Y, M[i]);
            };

            NSubArr.push(NSub);    
            YSubArr.push(YSub);
            BCArr.push(BC);

        }.bind(this));
        console.log(BCArr);
    };

    this.updateN = function(path) {
        updateNAjax(this);
    };

    this.Adm = 2.6544e-3 //Admittance of free space
    this.config = config;
    this.theta = 0;
    this.N = N;
    this.M = this.matrixBuild();
    //this.calcT();
    //this.calcR();

};

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
    addLayer(project, path);
    
});

function addLayer (stack, path) {
    splitstr = path.split("/").reverse();
        console.log('film is being added');
        stack.config.stack.push({"layer": splitstr[1], "d": 100, "path": path});
        listStack(stack.config);
        stack.updateN(path);
    }
});


function updateNAjax(stack) {
    $.ajax({
        url   :"add_layer/", //endpoint
        type  :"POST", // http method
        data  : {data:JSON.stringify(stack.config)}, // data send with post request
        success :function(json) {
            stack.N = parseJSON(json.N)
            stack.M = stack.matrixBuild();
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
        deleteFilm(project, suffix);
    });


    // deleteFilm function
    function deleteFilm(stack, id) {
        path = stack.config.stack[id].path;
        stack.config.stack.splice(id, 1);
        /*
        //if there are no other films
        var flag = false;
        $.each(stack.config.stack, function(i,w) {
            if (stack.config.stack[i].path == path) {
                //listStack(stack.config);
                flag = true;
                stack.updateN();
            }
        });
        if (flag == false) {
            stack.updateN();
            console.log('N repo updated');
        }
        */
        stack.updateN();
        listStack(stack.config);
    }

    // Save on submit
    $('#save-form').on('submit', function(event){ 
        event.preventDefault();
        console.log('save')
        var project_id = $(this).attr('name')
        save_stack(project.config, project_id)
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


