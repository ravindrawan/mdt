<?php
header('Content-Type: application/json');
require_once 'db.php';

$action = $_GET['action'] ?? '';

if ($action === 'get_data') {
    $year = $_GET['year'] ?? date('Y');
    $stmt = $pdo->prepare("SELECT * FROM training_records WHERE year = ?");
    $stmt->execute([$year]);
    $records = $stmt->fetchAll();
    
    foreach ($records as &$rec) {
        if (!empty($rec['lecturerEvals'])) {
            $rec['lecturerEvals'] = json_decode($rec['lecturerEvals'], true);
        } else {
            $rec['lecturerEvals'] = [];
        }
    }
    echo json_encode($records);
} 
elseif ($action === 'save_record') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $lecturerEvalsJson = isset($data['lecturerEvals']) ? json_encode($data['lecturerEvals']) : null;

        $stmt = $pdo->prepare("INSERT INTO training_records (year, nic, name, designation, office, trainingName, date, hours, foodRating, coordinationRating, feedback, lecturerEvals, absentDates, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['year'], $data['nic'], $data['name'], $data['designation'], $data['office'], 
            $data['trainingName'], $data['date'], $data['hours'], $data['foodRating'], 
            $data['coordinationRating'], $data['feedback'], $lecturerEvalsJson,
            $data['absentDates'], $data['confirmed']
        ]);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    }
}
elseif ($action === 'get_progress') {
    $year = $_GET['year'] ?? date('Y');
    $stmt = $pdo->prepare("SELECT * FROM progress_submissions WHERE year = ?");
    $stmt->execute([$year]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if (!empty($row['otherTrainings'])) {
            $row['otherTrainings'] = json_decode($row['otherTrainings'], true);
        } else {
            $row['otherTrainings'] = [];
        }
    }
    echo json_encode($rows);
}
elseif ($action === 'save_progress') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        $otherTrJson = isset($data['otherTrainings']) ? json_encode($data['otherTrainings']) : null;
        $stmt = $pdo->prepare("INSERT INTO progress_submissions (year, userId, office, designation, month, specialRemarks, productivityTasks, otherTrainings, pdfAttachment, submittedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['year'], $data['userId'], $data['office'], $data['designation'], 
            $data['month'], $data['specialRemarks'], $data['productivityTasks'], 
            $otherTrJson, $data['pdfAttachment'], $data['submittedAt']
        ]);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    }
}
else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}
?>
