<?php
// app/Contracts/Services/UserServiceInterface.php

namespace App\Interface;

interface UserInterface
{
    public function all();
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function userLeaves($userId);
    public function userSalary($userId);
    public function sendNotification(array $data);
    public function allEmployee();
}
