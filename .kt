webView.webChromeClient = object : WebChromeClient() {
        override fun onShowFileChooser(
            webView: WebView,
            filePathCallback: ValueCallback<Array<Uri>>,
            fileChooserParams: FileChooserParams
        ): Boolean {
            if (mUMA != null) {
                mUMA!!.onReceiveValue(null)
            }
            mUMA = filePathCallback
            var takePictureIntent: Intent? = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            if (takePictureIntent!!.resolveActivity(this@MainActivity.getPackageManager()) != null) {
                var photoFile: File? = null
                try {
                    photoFile = createImageFile()
                    takePictureIntent.putExtra("PhotoPath", mCM)
                } catch (ex: IOException) {
                    Log.e("Webview", "Image file creation failed", ex)
                }
                if (photoFile != null) {
                    mCM = "file:" + photoFile.getAbsolutePath()
                    takePictureIntent.putExtra(
                        MediaStore.EXTRA_OUTPUT,
                        Uri.fromFile(photoFile)
                    )
                } else {
                    takePictureIntent = null
                }
            }
            val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT)
            contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE)
            contentSelectionIntent.type = "*/*"
            val intentArray: Array<Intent>
            intentArray = takePictureIntent?.let { arrayOf(it) } ?: arrayOf<Intent>()
            val chooserIntent = Intent(Intent.ACTION_CHOOSER)
            chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
            chooserIntent.putExtra(Intent.EXTRA_TITLE, "Image Chooser")
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
            startActivityForResult(chooserIntent, FCR)
            return true
        }
    }

// Create an image file
@Throws(IOException::class)
private fun createImageFile(): File? {
    @SuppressLint("SimpleDateFormat") val timeStamp: String =
        SimpleDateFormat("yyyyMMdd_HHmmss").format(Date())
    val imageFileName = "img_" + timeStamp + "_"
    val storageDir: File =
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
    return File.createTempFile(imageFileName, ".jpg", storageDir)
}
fun openFileChooser(uploadMsg: ValueCallback<Uri?>?) {
    this.openFileChooser(uploadMsg, "*/*")
}

fun openFileChooser(
    uploadMsg: ValueCallback<Uri?>?,
    acceptType: String?
) {
    this.openFileChooser(uploadMsg, acceptType, null)
}

fun openFileChooser(
    uploadMsg: ValueCallback<Uri?>?,
    acceptType: String?,
    capture: String?
) {
    val i = Intent(Intent.ACTION_GET_CONTENT)
    i.addCategory(Intent.CATEGORY_OPENABLE)
    i.type = "*/*"
    this@MainActivity.startActivityForResult(
        Intent.createChooser(i, "File Browser"),
        FILECHOOSER_RESULTCODE
    )
}

override fun onActivityResult(
    requestCode: Int,
    resultCode: Int,
    intent: Intent?
) {
    super.onActivityResult(requestCode, resultCode, intent)
    if (Build.VERSION.SDK_INT >= 21) {
        var results: Array<Uri>? = null
        //Check if response is positive
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == FCR) {
                if (null == mUMA) {
                    return
                }
                if (intent == null) { //Capture Photo if no image available
                    if (mCM != null) {
                        results = arrayOf(Uri.parse(mCM))
                    }
                } else {
                    val dataString = intent.dataString
                    if (dataString != null) {
                        results = arrayOf(Uri.parse(dataString))
                    }
                }
            }
        }
        mUMA!!.onReceiveValue(results)
        mUMA = null
    } else {
        if (requestCode == FCR) {
            if (null == mUM) return
            val result =
                if (intent == null || resultCode != Activity.RESULT_OK) null else intent.data
            mUM!!.onReceiveValue(result)
            mUM = null
        }
    }
}

/*needed fileds 
 private var mCM: String? = null
 private var mUM: ValueCallback<Uri>? = null
 private var mUMA: ValueCallback<Array<Uri>>? = null
 private const val FCR = 1*/