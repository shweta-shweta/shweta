<?php

$name= $_REQUEST['name']; 
$email1= $_REQUEST['email'];
$subject = $_REQUEST['subject'];
$mobileno = $_REQUEST['number'];
$message = '';
$ip = $_SERVER['REMOTE_ADDR'];

$email = array('shindeshweta076@gmail.com');

send_mail("smtp.gmail.com",587,'noreply.vaoocabs@gmail.com','Prohibited','noreply.vaoocabs@gmail.com','New Contact',"Hello Team  <br> Name : $name<br> Email : $email1<br> Mobile NO : $mobileno<br>, message : $message",$email,'','');

function send_mail($host,$port,$uname,$pwd,$setfrom,$subject,$msg,$email_arr=array(),$cc,$image_name){
	//print_r($email_arr);
            include_once "class.phpmailer.php";
            $mail = new PHPMailer();
			$mail->IsSMTP(); // telling the class to use SMTP
			//$mail->Host       = "mail.yourdomain.com"; // SMTP server
			$mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
			$mail->Mailer = "smtp";                                               // 2 = messages only
			$mail->SMTPSecure = "ssl";
			$mail->Host = $host;     
			$mail->Port = 495;     
			$mail->SMTPAuth = true;  			// Enable SMTP authentication
            $mail->Username ="noreply.vaoocabs@gmail.com";                 // SMTP username
            $mail->Password = "Prohibited";         
			$mail->SetFrom($setfrom,"New contact");
			//added on 25 mar 2016 start
			$mail->IsHTML(true);
			//end
			//echo "sub : ".$setfrom;
			//$mail->AddReplyTo($from,"Reply : ");
			$mail->Subject    = $subject;
			$mail->AltBody    = ""; // optional, comment out and test
			$mail->MsgHTML($msg);
			
			foreach($email_arr as $email_id)
			{
				$name1="User";
				$mail->addAddress($email_id,$name1);     // Add a recipient
			}
          	if(!$mail->Send())
			{	
			return false;
			}
			else
			{
			?>
			<script type="text/javascript"> alert("Mail sent!"); </script>
			<?php
			}
			
	}
?>