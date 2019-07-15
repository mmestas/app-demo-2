var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");
const sass = require("gulp-sass");
const watchSass = require("gulp-watch-sass");

gulp.task("reveasy", function (argument) {
    gulp.src("index.html")
      .pipe(reveasy({
        base: 'C:\\Users\\Monette\\Documents\\GitHub\\appDemo2\\Design\\DiagnosticDashboard\\appDemo2App-Angular',
        revMode:'dom',
  			hashLength:7,
  			revType:'hash',
  			suffix:'v',
  			fileTypes:['css', 'js']
      }))
      .pipe(gulp.dest("./"))
});

gulp.task('sass', function(){
  return gulp.src('./sass/appDemo2.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('./css'))
});

gulp.task("sass:watch", () => watchSass([
  "./sass/**/*.{scss,css}"
])
  .pipe(sass())
  .pipe(gulp.dest("./css")));
