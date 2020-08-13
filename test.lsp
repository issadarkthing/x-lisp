
; (defun fact (# a)
;   (if (eq a 0)
; 	(id 1)
; 	(* a (fact (- a 1)))))

; (print (fact 10))

; (defun adder (# a b)
;   (+ a b))

; (defun len (# ls cnt)
;   (if (== ls nil)
; 	(prog
; 	  (id cnt))
; 	(prog
; 	  (set b (+ cnt 1))
; 	  (print ls b)
; 	  (len (cdr ls) b))))



; (set b (fib 10))
; (print (id "=>") b)
; (print (adder 10 10))
; (set a (cons 1 2 3))
; (print (len a 0))

(defun len (# ls)
  (if (== ls nil)
	(id 0)
	(+ 1 (len (cdr ls)))))


(defun fib (# x)
  (if (<= x 1)
	(id 1)
	(+ (fib (- x 1)) (fib (- x 2)))))

(print "=>" (len (cons 1 2 3) 0))
