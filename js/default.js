// For an introduction to the Fixed Layout template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232508
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    //APP VARS----------------------------------
    var col = false;
    var speed = 200;
    var points = 0;
    var lvl = 1;
    var head = 1;
    var addLvl = true;
    var x = 20, y = 20;
    var snakeLenght = 4;
    var snake = [];
    var direction = 1;
    var frame;
    var move;

    ///////////////

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
                
                //SHOW menu when start
                showMenu();

                //Add highscore when it appears
                $("#nameSubmit").click(function (e) {
                    if ($('#nameText').val() != "") {
                        $('#nameText').hide();
                        $('#nameSubmit').hide();
                        addHighscore(points, $('#nameText').val());
                    }
                });
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };
    //Set image to show
    var setImg = function (src) {
        var img = new Image();
        img.src = src;

        return img;
    }

    //GAME FUNCTION
    function game() {
        //HIDE INFO ON SCREEN
        $("#info").hide();
        $('#addHighscore').hide();
        //RESET VARS
        col = false;
        snake = [];
        speed = 200;
        points = 0;
        lvl = 1;
        head = 1;
        direction = 1;
        addLvl = true;
        x = 20, y = 20;
        snakeLenght = 4;

        var pause = false;
        //CHANGE MENU WHEN GAME STARTS
        $('#menu').html("<div id='pause'>Pause</div><div id='msg'></div>");

        //PAUSE CLICK
        $('#pause').click(function () {
            if (!pause) {
                clearInterval(move);
                clearInterval(frame);
                $('#pause').text("Resume");
                $("#info").text("PAUSE").show();
                pause = true;
            } else {
                move = setInterval(setMove, speed);
                frame = setInterval(setFrame, 33);
                $('#pause').text("Pause");
                $("#info").hide();
                pause = false;
            }
        });
        //update MESAGE
        $('#msg').html('Points: 0<br/>Level: 1');

        //canvas
        var c = document.getElementById("snakeCanvas");
        var ctx = c.getContext("2d");

        //GRAPHICS
        var snakeBody = setImg('images/body.png');
        var food = setImg('images/food.png');
        var snakeHead = [];
        snakeHead.push(setImg('images/head1.png'));
        snakeHead.push(setImg('images/head2.png'));
        snakeHead.push(setImg('images/head3.png'));
        snakeHead.push(setImg('images/head4.png'));
       
        snake.push({ "x": x, "y": y });
        for (var i = 1; i < snakeLenght; i++) {
            snake.push({ "x": x - i, "y": y });
        }
        //FOOD VARS
        var foodX = 30, foodY = 30;
        //MOVING THE SNAKE
        var setMove = function () {
            direction = head;
            switch (direction) {
                case 1: x++; break;
                case 3: x--; break;
                case 0: y--; break;
                case 2: y++; break;
            }
            //LOGIC///////////////////////////////////

            //CHECK FOR COLLISION
            if (x < 0 || y < 0 || x >= 50 || y >= 48)
                col = true;
            else {
                $.each(snake, function (i, el) {
                    if (el.x == x && el.y == y)
                        col = true;
                });
            }

            if (!col)
                snake.unshift({ "x": x, "y": y });
            else {
                //GAME OVER
                clearInterval(move);
                $('#scorePoints').text("Points: "+points);
                $('#nameText').val("").show();
                $('#addHighscore').show();
                $('#nameSubmit').show();
                $("#info").text("GAME OVER").show();
               
                showMenu();
            }

            //CHECK IF EATEN FOOD
            if (x != foodX || y != foodY) {
                if (!col) snake.pop();
            }
            else {
                points++;
                addLvl = true;
                $('#msg').html('Points: ' + points + '<br/>Level: ' + lvl);
                var loop = true;
                while (loop) {
                    loop = false;
                    foodX = Math.floor((Math.random() * c.width / 16) + 0);
                    foodY = Math.floor((Math.random() * c.height / 16) + 0);
                    $.each(snake, function (i, el) {
                        if (el.x == foodX && el.y == foodY)
                            loop = true;
                    });
                    if (!loop && x == foodX && y == foodY)
                        loop = true;
                }
            }

            //INCREASE LVL
            if (snake.length % 5 == 0 && addLvl) {
                addLvl = false;
                lvl++;
                $('#msg').html('Points: ' + points + '<br/>Level: ' + lvl);
                clearInterval(move);
                speed -= 5;
                move = setInterval(setMove, speed);
            }

        }
        move = setInterval(setMove, speed);

        var setFrame = function () {
            //DRAW////////////////////////////////////
            //clear buffer
            ctx.clearRect(0, 0, c.width, c.height);

            ctx.drawImage(food, foodX * 16, foodY * 16);
            $.each(snake, function (i, el) {
                if (i == 0)
                    ctx.drawImage(snakeHead[direction], el.x * 16, el.y * 16);
                else
                    ctx.drawImage(snakeBody, el.x * 16, el.y * 16);

            });

            if (col)
                clearInterval(frame);
        }
        frame = setInterval(setFrame, 33);

        //KEYS PUSH
        function keyDown(e) {
            var keyCode = e.keyCode;
            if (direction == head) {
                if (keyCode == 38) {
                    if (direction != 2) { head = 0; }
                } else if (keyCode == 40) {
                    if (direction != 0) { head = 2; }
                } else if (keyCode == 37) {
                    if (direction != 1) { head = 3; }
                } else if (keyCode == 39) {
                    if (direction != 3) { head = 1; }
                }
            }
        }

        document.addEventListener("keydown", keyDown, false);

    }

    //SHOW MENU when it need to be shown
    function showMenu() {
        $('#menu').html('<div id="start" class="menuOption">Start game</div><div id="highScores" class="menuOption">Show highscores</div>');
        $('#start').click(function () { game(); showKeys();});
        $('#highScores').click(function () { getHighscores(); $('#steering').hide(); });
    }

    //add highscores via web services
    function addHighscore(pts, name) {
        $.ajax({
            type: "GET",
            url: "http://snakewin8.cba.pl/setHighscores.php?pass=zaqwsx1991&name="+name+"&points=" + pts,
            success: function (data) {
               //When all ok
            }
        });
    }

    //get highscore via web and get it from returned html
    function getHighscores() {
        
        WinJS.xhr({ url: "http://snakewin8.cba.pl/getHighscores.php" }).done(
          function (data) {
              var score = $(toStaticHTML(data.response));
              $('#menu').html('<div id="scoresBack" class="win-backbutton"></div><br>Top 20<hr /><div id="showScores">' + toStaticHTML(score[3].innerHTML) + '</div>');
              $('#scoresBack').click(function () { showMenu(); });
          });

    }
    //SHOW TOUCH KEYS
    function showKeys() {
        $('#steering').show();
        $('#up').click(function () { if (direction != 2) { head = 0; } });
        $('#down').click(function () { if (direction != 0) { head = 2; } });

        $('#left').click(function () { if (direction != 1) { head = 3; } });
        $('#right').click(function () { if (direction != 3) { head = 1; } });
    }

    app.start();
})();
