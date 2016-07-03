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
            N = math.complex(v, -k[j]); //Create a complex refractive index
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
        console.log('Building Matrix');
        M = [];
        $.each(this.config.stack, function(i, obj) {
            console.log('matrixBuild layer = '+i);
            M.push(this.matrixElement(i));
        }.bind(this));
        this.M = M;
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
            M = multiply(M, matrix);
            console.log('layer = '+i)
        });

        return M;
        
    };

    this.calcStack = function() {
        //Define substrate matrix
        M = this.matrixMult();
        console.log(M[25]);

        substrate = this.config.output.path;
        input = this.config.input.path;

        nSub = this.N[substrate].n;
        kSub = this.N[substrate].k;

        nIn = this.N[input].n;
        kIn = this.N[input].k;

        NSubArr = [];
        YSubArr = [];
        NInArr = [];
        Y = [];
        T = [];
        R = [];
        BCArr = [];

        count = 0;

        $.each(nIn, function(i, v) {
            NSub = math.complex(nSub[i],kSub[i]);
            NIn = math.complex(nIn[i], kIn[i]);

            YSub = math.multiply(NSub, this.Adm);
            Y = math.matrix([1, YSub]);
            YIn = math.multiply(NIn, this.Adm);

            if (this.config.configuration == 'substrate') {
                BC = math.multiply(M[i], Y);
                B = BC._data[0];
                C = BC._data[1];
                TTop = math.multiply(math.multiply(4,YIn), YSub.re);
                TBot = math.add(math.multiply(YIn, B), C);
                TBotConj = math.conj(TBot);
                T.push(math.divide(TTop, math.multiply(TBot, TBotConj)).re);

                RTop = math.subtract(math.multiply(YIn, B), C);
                RFrac = math.divide(RTop, TBot)
                R.push(math.multiply(RFrac, math.conj(RFrac)));
            } else {
                BC = math.multiply(Y, M[i]);
            };

        }.bind(this));

        return {'x': this.N.x,
                'T': T,
                'R': R};
    };

    this.hello = function() {
        console.log('hello');
    }


    this.updateN = function(path) {
        updateNAjax(this);
    };

    this.Adm = 2.6544e-3 //Admittance of free space
    this.config = config;
    this.theta = 0;
    this.N = N;
    this.matrixBuild();
    this.T = this.calcStack();

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
    $('#stack').append("<li>"+config.input.layer+" (substrate)");

    for (item in config.stack) {
        if (item != 0) {
            var down = "<a class='down-layer film-operation' id='down-layer-"+item+"'>down</a>";
        } else {
            var down = '';
        };
        if (item != config.stack.length-1) {
            var up = "<a class='up-layer film-operation' id='up-layer-"+item+"'>up</a>";
        } else {
            var up = '';
        };

        var dup = "<a class='dup-layer film-operation' id='dup-layer-"+item+"'>copy</a>";

        var layer = config.stack[item];
        $('#stack').prepend("<li class='layer' id='layer"+item+"'>"+layer.layer+", "+layer.d+" - "+up+" "+down+" "+dup+"  <a class='delete-layer film-operation' id='delete-layer-"+item+"'>delete</a></li>")// | <a class='up-layer'>up</a> | <a class='down-layer'>down</a></li>");
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
            stack.matrixBuild();
            plotTR(stack.calcStack(), 'TR', 'out-page-chart');

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
        plot(libpage, 'nk', 'lib-page-chart');
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


       
});


$(function() {
    // stack click listener
    $('body').on("click", ".layer", function() {
        layerId = parseInt($(this).attr('id').replace('layer', ''));
        layerD = project.config.stack[layerId].d;
        $('input[name=Slider]').val(layerD).change();
        //var path = $(this).attr('id');
        //newpath = path.replace("!!", " ");
        //libPage(newpath);
    });

});

$('input[name=Slider]').on("change mousemove", function() {
    d = $(this).val();
    console.log($(this).val());
    project.config.stack[layerId].d = $(this).val();
    project.M[layerId] = project.matrixElement(layerId);
    plotTR(project.calcStack(), 'TR', 'out-page-chart');
    listStack(project.config);
});


