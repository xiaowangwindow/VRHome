<?php
if($_GET['u']){
    $url = 'http://www.vrzhijia.com/vrbdy.php?u='.$_GET['u'];
    header($url);
}
?>
