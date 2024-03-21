module.exports  = {
    entry: './jwt.js',
    output: {
        filename: './bundle.js'    
    },
    resolve: {
        //Add `.ts` and `.tsx` as a resolvable extension.
         extensions: ['', '.webpack.js', '.web.js','.js']
     },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
}
