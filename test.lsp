(defun fib (# x)
  (if (<= x 1)
	(id 1)
	(+ (fib (- x 1)) (fib (- x 2)))))

(defun fact (# a)
  (if (eq a 0)
	(id 1)
	(* a (fact (- a 1)))))


(set b (fib 12))
(print (id "=>") b)


; (set a 12)

; (- a 12)

; (print a)
