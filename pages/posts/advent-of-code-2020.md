title: Advent of Code 2020
published: 2020/12/19

---

Find all of my solutions [here](https://github.com/lwakefield/advent-of-code/tree/master/2020). 

## Day 01

A nice easy warm up! I was able to use Crystal's `each_permutation` method, which made the extension a one character edit, but I have no idea as to the performance:

```
numbers = File.read_lines("day_01.txt").map(&.to_i)
numbers.each_combination(2) do |combination|
    if combination.sum == 2020
        puts "part 1: #{combination.join(" + ")} = 2020"
        puts "part 2: #{combination.join(" * ")} = #{combination.product}"
    end
end
```

## Day 02

Still heating up! I was slowed down by part 2 due to misreading the instructions (I thought 1-5 was a range, not positions 1 and 5). I built up a count map for part 1, half expecting it to be useful in part 2, but alas.

```
def is_valid_part_one (min, max, char, password)
    counts = {} of Char => Int32
    password.chars.each do |c|
        counts[c] ||= 0
        counts[c] += 1
    end
    counts[char]? && counts[char] >= min && counts[char] <= max
end
def is_valid_part_two (min, max, char, password)
    (password[min - 1]? == char) ^ (password[max - 1]? == char)
end
valid_count_part_one = 0
valid_count_part_two = 0
File.read_lines("day_02.txt").each do |line|
    match = line.match /(?<min>\d+)-(?<max>\d+) (?<char>\w): (?<password>\w+)/
    match = match.not_nil!
    min = match["min"].to_i
    max = match["max"].to_i
    char = match["char"].chars.first # there should only be one
    password = match["password"]
    valid_count_part_one += 1 if is_valid_part_one(min, max, char, password)
    valid_count_part_two += 1 if is_valid_part_two(min, max, char, password)
end
puts valid_count_part_one
puts valid_count_part_two
```

## Day 03

Simple enough! I feel like I could have come up with a more elegant solution, so I am looking forward to seeing what y'all came up with.

## Day 04

Instructions and solution seemed clear to me! I did need to go bug hunting for the second part (hence the `puts`). It turned out I wasn't being restrictive enough on the regex, which [I fixed by adding the `^` and `$`](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_04.cr#L51).

The `not_nil!` statements are to force the typechecker to understand they cannot be nil at this point. [technically does this already](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_04.cr#L26), but the compiler isn't quite smart enough to work that out.

## Day 05

I started off using [ranges](https://crystal-lang.org/reference/syntax_and_semantics/literals/range.html) to represent the row/col ranges which looks good syntactically, but ended up being harder to work with. So I switched to regular ol' min/max variables.
I got a little tripped on the +/- offset when doing the BSP but the test cases made it pretty clear what needed to happen.
I did not add validation on the row_start == row_end, so I suppose if the dataset was messier that would have cost me.
And for part 2, I thought the algorithmic solution was going to be a little fiddly. So instead, I printed the seats to screen and solved graphically.
Anyway, [good fun](https://github.com/lwakefield/advent-of-code/blob/master/2020/day_05.cr)! The solution was clear to me, but there were enough "gotchas" and design decisions along the way to make it an interesting problem.

Laying in bed thinking about the problem beforehand, I was thinking about a solution with bit-bashing, but couldn't see the solution clearly. [This](https://github.com/sophiebits/adventofcode/blob/main/2020/day05.py#L12-L15) is what I wanted  to do.
Flicking through the reddit thread (sorting by oldest), the first solvers use the binary solution and the further back you go, the more solutions start to look like mine.
Not that I was racing, but definitely goes to show how valuable "the trick" was.

