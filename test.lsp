
(defun addUntil (# a b)
  (if (> b a)
	(prog
	  (print b)
	  (b))
	(addUntil a (+ b 1))))

(addUntil 10 0)
