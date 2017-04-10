<?php
namespace Uomi\Model;

class Loan extends \Illuminate\Database\Eloquent\Model {

	protected $cast = [
		'confirmed' => 'boolean',
	];

	public function loaner() {
		return $this->hasOne('Uomi\User', 'to');
	}

	public function borrower() {
		return $this->hasOne('Uomi\User', 'from');
	}

	public function category() {
		return $this->hasOne('Uomi\Category','category_id');
	}

	public function payments() {
		return $this->hasMany('Uomi\Payment','loan_id');
	}

	protected $dates = ['created_at', 'confirmed_at', 'completed_at'];
}
