<?php
// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$password = $_POST['password'];
$age = $_POST['age'];
$gender = $_POST['gender'];
$department = $_POST['department'];
$comments = $_POST['comments'];

// Handle checkboxes
$interests = "";
if (!empty($_POST['interests'])) {
    $interests = implode(", ", $_POST['interests']);
}

// Display submitted data
echo "<h2>Form Submitted Successfully ✅</h2>";
echo "Name: $name <br>";
echo "Email: $email <br>";
echo "Age: $age <br>";
echo "Gender: $gender <br>";
echo "Department: $department <br>";
echo "Interests: $interests <br>";
echo "Comments: $comments <br>";
?>
