var chirp = {};
var path = window.location.pathname;
var chirp_id = path.split('/')[2];
$('#users').hide();

$.ajax({
    method: "GET",
    url: "/api/chirps/" + chirp_id
    }).then(function(data){
        $('#chirp').val(data[0].message);
    },function(err){
        console.log(err);
})

$('#chirp-btn').click(function(){
    chirp.message = $('#chirp').val();
    chirp.user = parseInt(chirp_id);
    $.ajax({
        method: 'PUT',
        url: '/api/chirps/' + chirp_id,
        contentType: 'application/json',
        data: JSON.stringify(chirp)
    }).then(function(success){
        window.location.replace('/chirp/' + chirp_id);
    },function(err){
        console.log(err);
    })
})

$('#chirp').keyup(function () {
    checkMsg();
    updateCount();
})

function updateCount() {
    $('#word-cnt > span').text($('#chirp').val().length);
}

function checkMsg() {
    var chars = $('#chirp').val().length;
    if (chars > 0) {
        $('#chirp-btn').prop('disabled', false)
    } else {
        $('#chirp-btn').prop('disabled', true)
    }
}