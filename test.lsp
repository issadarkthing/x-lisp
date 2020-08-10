(defun fib (# x)
  (if (<= x 1)
	(id 1)
	(+ (fib (- x 1)) (fib (- x 2)))))

; (defun fact (# a)
;   (if (eq a 0)
; 	(id 1)
; 	(* a (fact (- a 1)))))

(defun adder (# a b)
  (+ a b))

(defun len (# ls cnt)
  (if (== ls nil)
	(prog
	  (id cnt))
	(prog
	  (set b (+ cnt 1))
	  (print ls b)
	  (len (cdr ls) b))))

; (set b (fib 16))
; (print (id "=>") b)
; (print (adder 10 10))
(set a (cons 1 2 3))
(print (len a 0))

