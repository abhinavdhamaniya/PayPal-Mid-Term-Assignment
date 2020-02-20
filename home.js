var express= require('express');
var os=require('os');
var fs= require('fs');
var bodyParser = require('body-parser');
var app= express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

var StudLoginreg="";
var ProfLoginreg="";

function readFileP(filename, type) {
    let promise = new Promise((resolve, reject) => { // fulfill, reject
        fs.readFile(filename, type, (error, result) => {
            if (error) { return reject(error); };
            resolve(result);
        })
    })
    return promise;
}
 

app.set('view engine', 'pug');  //to use the pug engine

app.set('views', './views'); //views are avialable in views folder


app.get('/', function(req,res)
{
    res.render('homepage');
});

app.get('/studLogin', function(req,res)
{
    res.render('studLogin');
});


app.get('/studSignup', function(req,res)
{
    res.render('studSignup');
});

app.get('/studentProfile', function(req,res)
{   

    var nreg= StudLoginreg;

    let promise = readFileP('studList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var flag=false;
            var index=-1;
            for(var i=0; i<datajson.students.length; i++)
            {
                if(datajson.students[i].regno==nreg)
                {
                    flag=true;
                    index=i;
                    break;
                }
                
            }
          
            res.render("studentProfile", {regno: nreg, name: datajson.students[index].name, pass: datajson.students[index].password, email: datajson.students[index].email, courses: JSON.stringify(datajson.students[index].courses)});
            
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
    
});

app.post('/studentProfile', function(req,res)
{
    var nreg= req.body.regno;
    var npass= req.body.pass;

    var flag=false;
    let promise = readFileP('studList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var flag=false;
            var index=-1;
            for(var i=0; i<datajson.students.length; i++)
            {
                if(datajson.students[i].regno==nreg && datajson.students[i].password==npass)
                {
                    flag=true;
                    index=i;
                    break;
                }
                
            }
            if(flag)
            {
                res.render("studentProfile", {regno: nreg, name: datajson.students[index].name, pass: npass, email: datajson.students[index].email, courses: JSON.stringify(datajson.students[index].courses)});
                StudLoginreg= nreg;
            }
            else res.send('Login failed');
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

});

app.post('/studSignup', function(req,res)
{
    var nreg= req.body.regno;
    var nname= req.body.name;
    var nemail= req.body.email;
    var npass= req.body.psw;

    var stud={
        regno: nreg,
        name: nname,
        email: nemail,
        password: npass,
        courses: []
    }
    let promise = readFileP('StudList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var flag=false;
            for(var i=0; i<datajson.students.length; i++)
            {
                if(datajson.students[i].regno==nreg)
                {
                    flag=true;
                }
            }
            if(flag)res.send("Student already exists with this Registration Number <a href='studSignUp'>Try Again</a>");
            else 
            {

                datajson.students.push(stud);

                fs.writeFile('./studList.json', JSON.stringify(datajson), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Student Added!')
                })
                res.send("Student account created Succesfully <a href='studLogin'>Login Here</a>");
            }
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
});


app.get('/subscribeCourse', function(req,res)
{
    var mcid= req.body.cid;
    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var str="";
            str+="<table id='customers'><tr><td>Course ID</td><td>Course Name</td><td>Course Author</td></tr>";
            for(var i=0; i<datajson.courses.length; i++)
            {
                str+="<tr><td>"+ datajson.courses[i].cid+"</td><td>"+datajson.courses[i].cname+"</td><td>"+datajson.courses[i].auth+"</td></tr>";
            }
            str+="</table>";

            res.render('subscribeCourse', {obj : str});
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
});

app.post('/subscribeCourse', function(req,res)
{
    var mcid= req.body.cid;

    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {

            var index=-1;
            var flag=false;
            var datajson= JSON.parse(data);

            for(var i=0; i<datajson.courses.length; i++)
            {
                if(datajson.courses[i].cid==mcid)
                {
                    index=i;
                    flag=true;
                    break;
                }
            }
        
            if(!flag)res.send("No course with the given ID exists <a href='subscribeCourse'>Try Again</a>");
            else{
                var scourse= datajson.courses[index];
                let promise1 = readFileP('studList.json', 'utf-8')
                promise1
                    .then((data) => {

                        var index1=-1;
                        var flag1=false;
                        var datajson1= JSON.parse(data);

                        for(var i=0; i<datajson1.students.length; i++)
                        {
                            if(datajson1.students[i].regno==StudLoginreg)
                            {
                                index1=i;
                                flag1=true;
                                break;
                            }
                        }

                        var alreadyf= false;
                        for(var i=0; i<datajson1.students[index1].courses.length; i++)
                        {
                            if(datajson1.students[index1].courses[i].cid==mcid)
                            {
                                alreadyf=true;
                                break;
                            }
                        }
                        if(alreadyf) res.send("You are already subscribed to this course");
                        else{
                            datajson1.students[index1].courses.push(scourse);
                            fs.writeFile('./studList.json', JSON.stringify(datajson1), 'utf-8', function(err) {
                                if (err) throw err
                                console.log('Course Added!')
                                res.send("You are subscribed! <a href='studentProfile'> Go Back </a>");
                            })
                         }
                        
                    })
                    .catch((err) => console.log(err))
                    .finally(() => console.log('done'))
                
            }
            
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

   
});

app.get('/getSubscribed', function(req,res)
{
    var mregno= StudLoginreg;
    let promise = readFileP('studList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var index=-1;
            for(var i=0; i<datajson.students.length; i++)
            {
                if(datajson.students[i].regno==mregno)
                {
                    index=i;
                    break;
                }
            }
            var str="";
            str+="<table id='customers'><tr><td>Course ID</td><td>Course Name</td><td>Course Author</td></tr>";
            for(var i=0; i<datajson.students[index].courses.length; i++)
            {
                str+="<tr><td>"+ datajson.students[index].courses[i].cid+"</td><td>"+datajson.students[index].courses[i].cname+"</td><td>"+datajson.students[index].courses[i].auth+"</td></tr>";
            }
            str+="</table>";
      
            res.render('getSubscribed', {name: datajson.students[index].name, obj: str});

        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

    
});

app.get('/proflogin', function(req,res)
{
    res.render('proflogin');
});


app.get('/profsignup', function(req,res)
{
    res.render('profsignup');
});

app.get('/createCourse', function(req,res)
{
    res.render('createCourse');
});

app.get('/courseByProff', function(req,res)
{
    res.render('courseByProff');
});

app.post('/courseByProff', function(req,res)
{
    var mauth= req.body.proff;
    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var resObj=[];

            for(var i=0; i<datajson.courses.length; i++)
            {
                if(datajson.courses[i].auth==mauth)
                {
                    resObj.push(datajson.courses[i]);
                }
            }

            var str="";
            str+="<table id='customers'><tr><td>Course ID</td><td>Course Name</td><td>Course Author</td></tr>";
            for(var i=0; i<datajson.courses.length; i++)
            {
                if(datajson.courses[i].auth==mauth)
                {
                    str+="<tr><td>"+ datajson.courses[i].cid+"</td><td>"+datajson.courses[i].cname+"</td><td>"+datajson.courses[i].auth+"</td></tr>";
                }
            }
            str+="</table>";
            if(resObj.length==0)res.send("No courses found <a href='courseByProff'>Try Again</a>");
            else res.render('dummyProfSearch', {obj: str});
            
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
});


app.get('/getAllCourses', function(req,res)
{
    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var str="";
            str+="<table id='customers'><tr><td>Course ID</td><td>Course Name</td><td>Course Author</td></tr>";
            for(var i=0; i<datajson.courses.length; i++)
            {
                str+="<tr><td>"+ datajson.courses[i].cid+"</td><td>"+datajson.courses[i].cname+"</td><td>"+datajson.courses[i].auth+"</td></tr>";
            }
            str+="</table>";
            
            res.render('getAllCourses', {obj: str});
            
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
    
});

app.get('/unsubCourse', function(req,res)
{
    res.render('unsubCourse');
});

app.post('/unsubCourse', function(req,res)
{
    var mcid= req.body.cid;
    var mregno= StudLoginreg;

    let promise = readFileP('studList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var index=-1;
            for(var i=0; i<datajson.students.length; i++)
            {
                if(datajson.students[i].regno==mregno)
                {
                    index=i;
                    break;
                }
            }

            var index2=-1;
            for(var i=0; i<datajson.students[index].courses.length; i++)
            {
                if(datajson.students[index].courses[i].cid==mcid)
                {
                    index2=i;
                    break;
                }
            }

            if(index2==-1) res.send("You are already unsubscribed to this course <a href='studentProfile'>Go Back</a>");
            else{
                datajson.students[index].courses.splice(index2,1);
                
                fs.writeFile('./studList.json', JSON.stringify(datajson), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Course Unsubscribed!')
                })
                res.send("<a href='studentProfile'>Go Back</a><br><h1>You have succesfully unsubscribed! </h1><br>Your currently subscribed courses are:<br>"+ JSON.stringify(datajson.students[index].courses));
               
            
            }
            
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

});

app.get('/updateCourse', function(req,res)
{
    res.render('updateCourse');
});

app.get('/prof_actual_profile', function(req,res)
{
    let promise = readFileP('proffList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var index=-1;
            for(var i=0; i<datajson.proffesors.length; i++)
            {
                if(datajson.proffesors[i].username==ProfLoginreg)
                {
                    index=i;
                    break;
                }
            }
            
            var nusername=datajson.proffesors[index].username;
            
            var nname=datajson.proffesors[index].name;
            
            var nemail=datajson.proffesors[index].email;
            
            var npass=datajson.proffesors[index].password;
           
            
            res.render('prof_actual_profile', {name:nname, username:nusername, pass:npass, email:nemail});
            
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
    
});


app.get('/deleteCourse', function(req,res)
{
    res.render('deleteCourse');
});

app.post('/deleteCourse', function(req,res)
{
    var mcid= req.body.cid;
    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var flag=false;
            var index=-1;
            for(var i=0; i<datajson.courses.length; i++)
            {
                if(datajson.courses[i].cid==mcid)
                {
                    flag=true;
                    index=i;
                    break;
                }
            }
            if(!flag)res.send("No Course with the given ID exists in the system. <a href='deleteCourse'>Try Again</a>");
            else 
            {
                fs.readFile('./courses.json', 'utf-8',function (err, data) {

                    if(err)throw err;
            
                    var arrayOfObjects = JSON.parse(data)
                    arrayOfObjects.courses.splice(index,1);
            
                    fs.writeFile('./courses.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                        if (err) throw err
                        console.log('Course Deleted!')
                        res.send("Course Deleted sucessfully! <a href='deleteCourse'> Go Back </a>");
                    })
                    
                });
            }
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
    
});

app.post('/updateCourse', function(req,res)
{
    var mcid= req.body.cid;
    var mcname= req.body.cname;
    var mauth= req.body.auth;

    var course={
        cid: mcid,
        cname: mcname,
        auth: mauth
    }


    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var flag=false;
            var index=-1;
            for(var i=0; i<datajson.courses.length; i++)
            {
                if(datajson.courses[i].cid==mcid)
                {
                    flag=true;
                    index=i;
                    break;
                }
            }
            if(!flag)res.send("No Course with the given ID exists in the system. <a href='updateCourse'>Try Again</a>");
            else 
            {
                fs.readFile('./courses.json', 'utf-8',function (err, data) {

                    if(err)throw err;
            
                    var arrayOfObjects = JSON.parse(data)
                    arrayOfObjects.courses[index]=course;
            
                    fs.writeFile('./courses.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                        if (err) throw err
                        console.log('Course Updated!')
                        res.send("Course Updated sucessfully! <a href='updateCourse'> Go Back </a>");
                    })
                    
                });
            }
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))
});

app.post('/createCourse', function(req,res)
{
    var mcid= req.body.cid;
    var mcname= req.body.cname;
    var mauth= req.body.auth;

    var course={
        cid: mcid,
        cname: mcname,
        auth: mauth
    }
    
    //check if course with given id already exists
    let promise = readFileP('courses.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);

            var flag=false;
            for(var i=0; i<datajson.courses.length; i++)
            {
                if(datajson.courses[i].cid==mcid)
                {
                    flag=true;
                }
            }
            if(flag)res.send("Course with given ID already exists, enter a different CourseID <a href='createCourse'> Try Again </a>");
            else 
            {
                fs.readFile('./courses.json', 'utf-8',function (err, data) {

                    if(err)throw err;
            
                    var arrayOfObjects = JSON.parse(data)
            
                    arrayOfObjects.courses.push(course);
            
                    fs.writeFile('./courses.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                        if (err) throw err
                        console.log('Course Added!')
                        res.send("Course added sucessfully! <a href='createCourse'> Go Back </a>");
                    })
                    
                });
            }
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

    
});

app.post('/prof_actual_profile', function(req,res)
{
  
    var nusername= req.body.uname;
    ProfLoginreg=nusername;
    var npass= req.body.pass;
    var flag=false;
    let promise = readFileP('ProffList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var plist="";
            var flag=false;
            var index=-1;
            for(var i=0; i<datajson.proffesors.length; i++)
            {
                if(datajson.proffesors[i].username==nusername && datajson.proffesors[i].password==npass)
                {
                    flag=true;
                    index=i;
                    break;
                }
                
            }
            if(flag)res.render("prof_actual_profile", {name: datajson.proffesors[index].name, username: datajson.proffesors[index].username, pass:datajson.proffesors[index].password, email: datajson.proffesors[index].email});
            else res.send('Login failed');
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

    
    //res.render('prof_actual_profile');
});

app.post('/prof_profile', function(req,res)
{
    var nusername= req.body.uname;
    var nname= req.body.name;
    var nemail= req.body.email;
    var npass= req.body.psw;

    var proff={
        username: nusername,
        name: nname,
        email: nemail,
        password: npass
    }
    
    
    let promise = readFileP('proffList.json', 'utf-8')
    promise
        .then((data) => {
            var datajson= JSON.parse(data);
            var flag=false;
            for(var i=0; i<datajson.proffesors.length; i++)
            {
                if(datajson.proffesors[i].username==nusername)
                {
                    flag=true;
                }
            }
            if(flag)res.send("Proffesor already exists with this UserName <a href='profsignUp'>Try Again</a>");
            else 
            {

                datajson.proffesors.push(proff);

                fs.writeFile('./proffList.json', JSON.stringify(datajson), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Proffesor Added!')
                })
                var str="<table id='customers'>";
                str+="<tr><th>Username</th><th>Name</th><th>Email</th><tr>";
                for(var i=0; i<datajson.proffesors.length; i++)
                {
                    str+= "<tr><td>"+datajson.proffesors[i].username+"</td><td>"+datajson.proffesors[i].name+"</td><td> "+datajson.proffesors[i].email+ "</td></tr>";
                }
                str+="</table>"
                res.render('prof_profile', {proffList:str});
            }
        })
        .catch((err) => console.log(err))
        .finally(() => console.log('done'))

    
});

app.listen(690);