var progress;
progress = progress || (function () {
//	$('#mymodal').on('shown.bs.modal', function () {
// 
//	    var progress = setInterval(function() {
//	    var $bar = $('.bar');
//
//	    if ($bar.width()==500) {
//	      
//		// complete
//	      
//		clearInterval(progress);
//		$('.progress').removeClass('active');
//		$('#myModal').modal('hide');
//		$bar.width(0);
//		
//	    } else {
//	      
//		// perform processing logic here
//	      
//		$bar.width($bar.width()+50);
//	    }
//	    
//	    $bar.text($bar.width()/5 + "%");
//		}, 800);
//	  
//	  
//	});

    return {
        showPleaseWait: function() {
		$('#myModal').modal('show');

	},
        hidePleaseWait: function () {
            $('#myModal').modal('hide');
        },

    };
})();

var app;
app = app || (function () {
    var process = $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><div class="modal-header"><h1>Processing...</h1></div><div class="modal-body"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div></div>');
    return {
        showProcess: function() {
            process.modal('show');
        },
        hideProcess: function () {
            process.modal('hide');
        },
 
    };
})();
