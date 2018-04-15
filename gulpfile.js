// var gulp  = require('gulp'),
//     gutil = require('gulp-util');

// gulp.task('server', function () {
//         // Start the server at the beginning of the task 
//         server.run(['app.js']);
     
//         // Restart the server when file changes 
//         gulp.watch(['app/**/*.html'], server.notify);
//         gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
//         //gulp.watch(['{.tmp,app}/styles/**/*.css'], ['styles:css', server.notify]); 
//         //Event object won't pass down to gulp.watch's callback if there's more than one of them. 
//         //So the correct way to use server.notify is as following: 
//         gulp.watch(['{.tmp,app}/styles/**/*.css'], function(event){
//             gulp.run('styles:css');
//             server.notify(event);
//             //pipe support is added for server.notify since v0.1.5, 
//             //see https://github.com/gimm/gulp-express#servernotifyevent 
//         });
     
//         gulp.watch(['app/scripts/**/*.js'], ['jshint']);
//         gulp.watch(['app/images/**/*'], server.notify);
//         gulp.watch(['app.js', 'routes/**/*.js'], [server.run]);
//     });
// // create a default task and just log a message
// gulp.task('default', function() {
//   return gutil.log('Gulp is running!')
// });


var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
  , jshint = require('gulp-jshint')
 
gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})
 
gulp.task('develop', function () {
  var stream = nodemon({ script: 'server.js'
          , ext: 'html js'
          , ignore: ['ignored.js']
          , tasks: ['lint'] })
 
  stream
      .on('restart', function () {
        console.log('restarted!')
      })
      .on('crash', function() {
        console.error('Application has crashed!\n')
         stream.emit('restart', 10)  // restart the server in 10 seconds 
      })
})